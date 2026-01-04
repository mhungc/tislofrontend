'use client'

import React, { useState, useEffect } from 'react'
import { BookingService } from '@/lib/services/booking-service'
import { ServiceService } from '@/lib/services/service-service'
import { CustomerService } from '@/lib/services/customer-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Calendar, 
  Clock, 
  User, 
  Package, 
  Save, 
  X, 
  DollarSign,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { ModifierSelector } from '../booking/ModifierSelector'

interface BookingFormProps {
  shopId: string
  bookingId?: string
  onSave?: () => void
  onCancel?: () => void
  className?: string
}

interface BookingFormData {
  customerData: {
    full_name: string
    email: string
    phone: string
  }
  bookingData: {
    booking_date: string
    start_time: string
    end_time: string
    notes: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  }
  selectedServices: string[]
}

export function BookingForm({
  shopId,
  bookingId,
  onSave,
  onCancel,
  className = ''
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerData: {
      full_name: '',
      email: '',
      phone: ''
    },
    bookingData: {
      booking_date: '',
      start_time: '',
      end_time: '',
      notes: '',
      status: 'pending'
    },
    selectedServices: []
  })
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [modifierAdjustments, setModifierAdjustments] = useState({ duration: 0, price: 0 })

  const bookingService = new BookingService()
  const serviceService = new ServiceService()
  const customerService = new CustomerService()

  // Cargar servicios
  useEffect(() => {
    loadServices()
  }, [shopId])

  // Cargar reserva si estamos editando
  useEffect(() => {
    if (bookingId && bookingId !== 'new') {
      loadBooking()
    }
  }, [bookingId])

  // Calcular total cuando cambien los servicios seleccionados o modificadores
  useEffect(() => {
    calculateTotals()
  }, [formData.selectedServices, modifierAdjustments])

  const loadServices = async () => {
    try {
      const shopServices = await serviceService.getShopServices(shopId)
      setServices(shopServices)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      toast.error('Error al cargar los servicios')
    }
  }

  const loadBooking = async () => {
    if (!bookingId || bookingId === 'new') return

    setLoading(true)
    try {
      const booking: any = await bookingService.getBooking(bookingId)
      if (booking) {
        setFormData({
          customerData: {
            full_name: booking.customer.full_name,
            email: booking.customer.email || '',
            phone: booking.customer.phone || ''
          },
          bookingData: {
            booking_date: booking.booking_date ?? booking.bookingDate ?? '',
            start_time: booking.start_time ?? booking.startTime ?? '',
            end_time: booking.end_time ?? booking.endTime ?? '',
            notes: booking.notes || '',
            status: booking.status
          },
          selectedServices: booking.services.map((s: any) => s.service_id)
        })
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error al cargar reserva:', error)
      toast.error('Error al cargar la reserva')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const selectedServiceObjects = services.filter(s => formData.selectedServices.includes(s.id))
    const baseTotal = selectedServiceObjects.reduce((sum, service) => sum + (service.price || 0), 0)
    const baseDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration_minutes, 0)
    
    // Aplicar ajustes de modificadores
    const finalTotal = baseTotal + modifierAdjustments.price
    const finalDuration = baseDuration + modifierAdjustments.duration
    
    setTotalAmount(finalTotal)
    setTotalDuration(finalDuration)
  }

  // Actualizar campo del formulario
  const updateField = (section: 'customerData' | 'bookingData', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Manejar selección de servicios
  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(id => id !== serviceId)
    }))
  }

  // Manejar cambios en modificadores
  const handleModifiersChange = (modifierIds: string[], totalDuration: number, totalPrice: number) => {
    setSelectedModifiers(modifierIds)
    setModifierAdjustments({ duration: totalDuration, price: totalPrice })
  }

  // Validar formulario
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!formData.customerData.full_name.trim()) {
      errors.push('El nombre del cliente es requerido')
    }

    if (!formData.customerData.email && !formData.customerData.phone) {
      errors.push('Debe proporcionar al menos un email o teléfono')
    }

    if (!formData.bookingData.booking_date) {
      errors.push('La fecha de reserva es requerida')
    }

    if (!formData.bookingData.start_time) {
      errors.push('La hora de inicio es requerida')
    }

    if (formData.selectedServices.length === 0) {
      errors.push('Debe seleccionar al menos un servicio')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Guardar reserva
  const saveBooking = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    setSaving(true)
    try {
      if (isEditing && bookingId && bookingId !== 'new') {
        // Actualizar reserva existente
        await bookingService.updateBooking(bookingId, formData.bookingData)
        toast.success('Reserva actualizada correctamente')
      } else {
        // Crear nueva reserva
        const bookingData = {
          customer_name: formData.customerData.full_name,
          customer_email: formData.customerData.email,
          customer_phone: formData.customerData.phone,
          booking_date: formData.bookingData.booking_date,
          start_time: formData.bookingData.start_time,
          end_time: formData.bookingData.end_time,
          service_id: formData.selectedServices[0], // Por ahora solo el primer servicio
          notes: formData.bookingData.notes,
          total_duration: totalDuration,
          total_price: totalAmount
        }
        await bookingService.createManualBooking(shopId, bookingData)
        toast.success('Reserva creada correctamente')
      }
      
      onSave?.()
    } catch (error) {
      console.error('Error al guardar reserva:', error)
      toast.error('Error al guardar la reserva')
    } finally {
      setSaving(false)
    }
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del Cliente */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Información del Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-name">Nombre Completo *</Label>
              <Input
                id="customer-name"
                placeholder="Nombre del cliente"
                value={formData.customerData.full_name}
                onChange={(e) => updateField('customerData', 'full_name', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="customer-email">Email</Label>
              <div className="relative mt-1">
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.customerData.email}
                  onChange={(e) => updateField('customerData', 'email', e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer-phone">Teléfono</Label>
              <div className="relative mt-1">
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.customerData.phone}
                  onChange={(e) => updateField('customerData', 'phone', e.target.value)}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la Reserva */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Detalles de la Reserva
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="booking-date">Fecha *</Label>
              <Input
                id="booking-date"
                type="date"
                value={formData.bookingData.booking_date}
                onChange={(e) => updateField('bookingData', 'booking_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="start-time">Hora de Inicio *</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.bookingData.start_time}
                onChange={(e) => updateField('bookingData', 'start_time', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="end-time">Hora de Fin</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.bookingData.end_time}
                onChange={(e) => updateField('bookingData', 'end_time', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="booking-status">Estado</Label>
            <select
              value={formData.bookingData.status}
              onChange={(e) => updateField('bookingData', 'status', e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
              <option value="completed">Completado</option>
            </select>
          </div>

          <div>
            <Label htmlFor="booking-notes">Notas</Label>
            <Textarea
              id="booking-notes"
              placeholder="Notas adicionales sobre la reserva..."
              value={formData.bookingData.notes}
              onChange={(e) => updateField('bookingData', 'notes', e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Servicios */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Servicios Seleccionados
          </h3>
          
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay servicios disponibles</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    isChecked={formData.selectedServices.includes(service.id)}
                    onChange={(e) => 
                      handleServiceSelection(service.id, e.target.checked)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(service.price)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(service.duration_minutes)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modificadores */}
        {formData.selectedServices.length > 0 && (
          <div className="space-y-4">
            {formData.selectedServices.map(serviceId => (
              <ModifierSelector
                key={serviceId}
                serviceId={serviceId}
                customerData={{
                  customer_name: formData.customerData.full_name,
                  customer_email: formData.customerData.email,
                  customer_phone: formData.customerData.phone
                }}
                selectedModifiers={selectedModifiers}
                onModifiersChange={handleModifiersChange}
              />
            ))}
          </div>
        )}

        {/* Resumen */}
        {formData.selectedServices.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Resumen de la Reserva</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios seleccionados:</span>
                  <span className="font-medium">{formData.selectedServices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración total:</span>
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                {(modifierAdjustments.duration !== 0 || modifierAdjustments.price !== 0) && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Ajustes por modificadores:</div>
                      {modifierAdjustments.duration !== 0 && (
                        <div className="flex justify-between text-xs">
                          <span>Tiempo adicional:</span>
                          <span>+{modifierAdjustments.duration} min</span>
                        </div>
                      )}
                      {modifierAdjustments.price !== 0 && (
                        <div className="flex justify-between text-xs">
                          <span>Costo adicional:</span>
                          <span>+{formatPrice(modifierAdjustments.price)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            onClick={saveBooking}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

