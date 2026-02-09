'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BookingService } from '@/lib/services/booking-service'
import { Calendar } from '@/components/booking/Calendar'
import { TimeSlots } from '@/components/booking/TimeSlots'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, CheckCircle, ArrowLeft, User, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { ModifierSelector } from '@/components/booking/ModifierSelector'
import { calculateBookingTotals } from '@/lib/utils/booking-totals'

export default function BookingPage() {
  const params = useParams()
  const token = params.token as string
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    consent: false,
    marketing: false
  })
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [modifierAdjustments, setModifierAdjustments] = useState({ duration: 0, price: 0 })

  const bookingService = new BookingService()

  useEffect(() => {
    loadBookingData()
  }, [token])

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate, selectedServices])

  const loadBookingData = async () => {
    try {
      const data = await bookingService.getBookingData(token)
      setShop(data.shop)
      setServices(data.services)
    } catch (error) {
      toast.error('Enlace inválido o expirado')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    setSlotsLoading(true)
    try {
      const slots = await bookingService.getAvailableSlots(token, selectedDate, selectedServices)
      setAvailableSlots(slots)
      setSelectedTime('') // Reset selected time when date changes
    } catch (error) {
      toast.error('Error al cargar disponibilidad')
    } finally {
      setSlotsLoading(false)
    }
  }

  const getTotals = () => {
    const selectedServiceObjects = selectedServices
      .map(serviceId => services.find(s => s.id === serviceId))
      .filter(Boolean)

    return calculateBookingTotals(
      selectedServiceObjects.map(service => ({
        duration_minutes: service.duration_minutes,
        price: service.price
      })),
      [
        {
          applied_duration: modifierAdjustments.duration,
          applied_price: modifierAdjustments.price
        }
      ]
    )
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleModifiersChange = (modifierIds: string[], totalDuration: number, totalPrice: number) => {
    setSelectedModifiers(modifierIds)
    setModifierAdjustments({ duration: totalDuration, price: totalPrice })
  }

  const sendVerificationCode = async () => {
    if (!customerData.email) {
      toast.error('Email es requerido')
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerData.email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      setVerificationStep(true)
      toast.success('Código enviado a tu email')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar código')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async () => {
    if (!customerData.name || !customerData.email) {
      toast.error('Nombre y email son requeridos')
      return
    }
    
    if (!customerData.consent) {
      toast.error('Debes aceptar el tratamiento de datos para continuar')
      return
    }

    // Si no está en paso de verificación, enviar código
    if (!verificationStep) {
      await sendVerificationCode()
      return
    }

    // Si está en paso de verificación, verificar código y crear reserva
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos')
      return
    }

    setSubmitting(true)
    try {
      await bookingService.createBooking(token, {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        booking_date: selectedDate,
        start_time: selectedTime,
        services: selectedServices,
        notes: customerData.notes,
        modifiers: selectedModifiers,
        consent: customerData.consent,
        marketing: customerData.marketing,
        verification_code: verificationCode
      })
      
      setBookingComplete(true)
      toast.success('¡Reserva creada exitosamente!')
    } catch (error: any) {
      if (error.message.includes('código')) {
        toast.error('Código inválido o expirado')
      } else {
        toast.error('Error al crear la reserva')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3) // 3 months ahead
    return maxDate.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Reserva Creada!</h2>
            <p className="text-muted-foreground mb-4">
              Tu reserva está pendiente de confirmación. Te enviaremos un email cuando sea confirmada.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{shop?.name}</p>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
              <p className="text-sm text-gray-600">a las {selectedTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totals = getTotals()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">{shop?.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{shop?.address}</span>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-0.5 mx-2 ${
                  i < step ? 'bg-primary' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Services */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selecciona tus servicios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(service.duration_minutes)}</span>
                            </div>
                            <Badge variant="outline">
                              ${service.price || 'Gratis'}
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedServices.includes(service.id)
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Modificadores - Solo mostrar si hay servicios seleccionados */}
            {step === 1 && selectedServices.length > 0 && (
              <div className="space-y-4">
                {selectedServices.map(serviceId => (
                  <ModifierSelector
                    key={serviceId}
                    serviceId={serviceId}
                    customerData={{
                      customer_name: customerData.name,
                      customer_email: customerData.email,
                      customer_phone: customerData.phone
                    }}
                    selectedModifiers={selectedModifiers}
                    onModifiersChange={handleModifiersChange}
                  />
                ))}
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Selecciona una fecha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      minDate={getMinDate()}
                      maxDate={getMaxDate()}
                    />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Horarios disponibles</CardTitle>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedDate)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <TimeSlots
                        slots={availableSlots}
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                        loading={slotsLoading}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Customer Info */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Nombre completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={customerData.name}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Tu nombre completo"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="tu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Tu número de teléfono"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        value={customerData.notes}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Alguna información adicional que quieras compartir..."
                        rows={3}
                      />
                    </div>
                    
                    {verificationStep && (
                      <div>
                        <Label htmlFor="verification">Código de verificación</Label>
                        <Input
                          id="verification"
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="text-center text-lg tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Ingresa el código de 6 dígitos enviado a {customerData.email}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={customerData.consent || false}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, consent: e.target.checked }))}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="consent" className="text-sm leading-5">
                          Acepto que mis datos sean utilizados para gestionar mi reserva y recibir comunicaciones relacionadas con el servicio. 
                          <span className="text-muted-foreground">
                            Puedes solicitar la eliminación de tus datos en cualquier momento.
                          </span>
                        </Label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="marketing"
                          checked={customerData.marketing || false}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="marketing" className="text-sm leading-5">
                          <span className="text-muted-foreground">(Opcional)</span> Quiero recibir ofertas especiales y promociones por email.
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Services */}
                {selectedServices.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Servicios seleccionados</h4>
                    <div className="space-y-2">
                      {selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId)
                        return service ? (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>${Number(service.price || 0).toFixed(2)}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                    <Separator className="my-3" />
                    {(modifierAdjustments.duration !== 0 || modifierAdjustments.price !== 0) && (
                      <>
                        <div className="text-xs text-gray-600 mb-1">Ajustes:</div>
                        {modifierAdjustments.duration !== 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Tiempo adicional:</span>
                            <span>+{modifierAdjustments.duration} min</span>
                          </div>
                        )}
                        {modifierAdjustments.price !== 0 && (
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Costo adicional:</span>
                            <span>+${Number(modifierAdjustments.price).toFixed(2)}</span>
                          </div>
                        )}
                        <Separator className="my-2" />
                      </>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total: {formatDuration(totals.totalDuration)}</span>
                      <span>${totals.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Selected Date & Time */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium mb-2">Fecha y hora</h4>
                    <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                    {selectedTime && (
                      <p className="text-sm text-gray-600">a las {selectedTime}</p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {step === 1 && (
                    <Button 
                      onClick={() => setStep(2)} 
                      disabled={selectedServices.length === 0}
                      className="w-full"
                    >
                      Continuar
                    </Button>
                  )}
                  {step === 2 && (
                    <Button 
                      onClick={() => setStep(3)} 
                      disabled={!selectedDate || !selectedTime}
                      className="w-full"
                    >
                      Continuar
                    </Button>
                  )}
                  {step === 3 && (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || sendingCode || !customerData.name || !customerData.email || !customerData.consent}
                        className="w-full"
                      >
                        {sendingCode ? 'Enviando código...' : 
                         submitting ? 'Creando reserva...' : 
                         verificationStep ? 'Verificar y Confirmar' : 'Enviar código de verificación'}
                      </Button>
                      
                      {verificationStep && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setVerificationStep(false)
                            setVerificationCode('')
                          }}
                          className="w-full"
                        >
                          Cambiar email
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}