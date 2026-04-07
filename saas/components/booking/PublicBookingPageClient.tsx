'use client'

import React, { useState, useEffect } from 'react'
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
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface PublicBookingPageClientProps {
  token: string
  locale: Locale
  dict: Dictionary
}

export function PublicBookingPageClient({ token, locale, dict }: PublicBookingPageClientProps) {
  const DEBUG_TAG = '[BOOKING_DEBUG]'
  const bookingDict = dict.booking
  const commonDict = dict.common

  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({})
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
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [modifierAdjustments, setModifierAdjustments] = useState({ duration: 0, price: 0 })

  const selectedServiceIds = Object.keys(serviceCounts).filter((serviceId) => (serviceCounts[serviceId] || 0) > 0)
  const selectedServicesExpanded = selectedServiceIds.flatMap((serviceId) =>
    Array(serviceCounts[serviceId]).fill(serviceId)
  )
  const selectedServiceKey = selectedServicesExpanded.join(',')

  const bookingService = new BookingService()

  useEffect(() => {
    loadBookingData()
  }, [token])

  useEffect(() => {
    if (selectedDate) loadAvailableSlots()
  }, [selectedDate, selectedServiceKey])

  const loadBookingData = async () => {
    try {
      const data = await bookingService.getBookingData(token)
      console.log(`${DEBUG_TAG} booking-data`, {
        tokenPreview: token.slice(0, 8),
        shopId: data?.shop?.id,
        shopName: data?.shop?.name,
        timezone: data?.shop?.timezone,
        baseSlotMinutes: data?.shop?.base_slot_minutes,
        bufferMinutes: data?.shop?.buffer_minutes,
        servicesCount: Array.isArray(data?.services) ? data.services.length : 0,
        schedulesCount: Array.isArray(data?.schedules) ? data.schedules.length : 0,
        schedules: data?.schedules
      })
      setShop(data.shop)
      setServices(data.services)
    } catch (error) {
      console.error(`${DEBUG_TAG} booking-data-error`, error)
      toast.error(bookingDict.invalidLink)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    setSlotsLoading(true)
    try {
      console.log(`${DEBUG_TAG} availability-request`, {
        tokenPreview: token.slice(0, 8),
        selectedDate,
        selectedServiceIds,
        expandedServices: selectedServicesExpanded,
        nowIso: new Date().toISOString(),
        calendarMinDate: getMinDate(),
        calendarMaxDate: getMaxDate(),
        timezone: shop?.timezone,
        baseSlotMinutes: shop?.base_slot_minutes,
        bufferMinutes: shop?.buffer_minutes
      })

      const slots = await bookingService.getAvailableSlots(token, selectedDate, selectedServicesExpanded)

      console.log(`${DEBUG_TAG} availability-response`, {
        selectedDate,
        totalSlots: Array.isArray(slots) ? slots.length : 0,
        availableSlots: Array.isArray(slots) ? slots.filter((s: any) => s?.available).length : 0,
        firstSlots: Array.isArray(slots) ? slots.slice(0, 8) : slots
      })

      setAvailableSlots(slots)
      setSelectedTime('')
    } catch (error) {
      console.error(`${DEBUG_TAG} availability-error`, error)
      toast.error(commonDict.error)
    } finally {
      setSlotsLoading(false)
    }
  }

  const getTotalDuration = () => {
    const baseDuration = selectedServicesExpanded.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return total + (service?.duration_minutes || 0)
    }, 0)
    return baseDuration + modifierAdjustments.duration
  }

  const getTotalPrice = () => {
    const basePrice = selectedServicesExpanded.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return total + Number(service?.price || 0)
    }, 0)
    return basePrice + Number(modifierAdjustments.price || 0)
  }

  const handleServiceIncrement = (serviceId: string) => {
    setServiceCounts((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1
    }))
  }

  const handleServiceDecrement = (serviceId: string) => {
    setServiceCounts((prev) => {
      const current = prev[serviceId] || 0
      if (current <= 1) {
        const { [serviceId]: _removed, ...rest } = prev
        return rest
      }
      return {
        ...prev,
        [serviceId]: current - 1
      }
    })
  }

  const handleModifiersChange = (modifierIds: string[], totalDuration: number, totalPrice: number) => {
    setSelectedModifiers(modifierIds)
    setModifierAdjustments({ duration: totalDuration, price: totalPrice })
  }

  const sendVerificationCode = async () => {
    if (!customerData.email) {
      toast.error(bookingDict.errors.requiredFields)
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
        throw new Error(error.error || bookingDict.errors.bookingFailed)
      }

      setVerificationStep(true)
      toast.success(bookingDict.verificationDescription)
    } catch (error: any) {
      toast.error(error?.message || bookingDict.errors.bookingFailed)
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async () => {
    if (!customerData.name || !customerData.email) {
      toast.error(bookingDict.errors.requiredFields)
      return
    }

    if (!customerData.consent) {
      toast.error(bookingDict.errors.consentRequired)
      return
    }

    if (!verificationStep) {
      await sendVerificationCode()
      return
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error(bookingDict.errors.verificationRequired)
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
        services: selectedServicesExpanded,
        notes: customerData.notes,
        modifiers: selectedModifiers,
        consent: customerData.consent,
        marketing: customerData.marketing,
        verification_code: verificationCode,
        locale
      })
      setBookingComplete(true)
      toast.success(bookingDict.requestReceivedDescription)
    } catch {
      toast.error(bookingDict.errors.bookingFailed)
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
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const toDateInputString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getMinDate = () => toDateInputString(new Date())

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return toDateInputString(maxDate)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{bookingDict.requestReceivedTitle}</h2>
            <p className="text-muted-foreground mb-4">{bookingDict.requestReceivedDescription}</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{shop?.name}</p>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
              <p className="text-sm text-gray-600">{bookingDict.time}: {selectedTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-b px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            {step > 1 && <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4" /></Button>}
            <div>
              <h1 className="text-2xl font-bold">{shop?.name}</h1>
              <div className="flex items-center gap-2 text-gray-600"><MapPin className="h-4 w-4" /><span className="text-sm">{shop?.address}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{i}</div>
                {i < 3 && <div className={`w-12 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-4">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle>{bookingDict.selectServices}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {services.map(service => (
                    <div key={service.id} className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${selectedServiceIds.includes(service.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleServiceIncrement(service.id)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600"><Clock className="h-4 w-4" /><span>{formatDuration(service.duration_minutes)}</span></div>
                            <Badge variant="outline">${service.price || (locale === 'en' ? 'Free' : 'Gratis')}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleServiceDecrement(service.id)}
                            disabled={!selectedServiceIds.includes(service.id)}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{serviceCounts[service.id] || 0}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleServiceIncrement(service.id)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {step === 1 && selectedServiceIds.length > 0 && (
              <div className="space-y-4">
                {selectedServiceIds.map(serviceId => (
                  <ModifierSelector key={serviceId} serviceId={serviceId} customerData={{ customer_name: customerData.name, customer_email: customerData.email, customer_phone: customerData.phone }} selectedModifiers={selectedModifiers} onModifiersChange={handleModifiersChange} locale={locale} />
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>{bookingDict.selectDate}</CardTitle></CardHeader>
                  <CardContent><Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} minDate={getMinDate()} maxDate={getMaxDate()} locale={locale} /></CardContent>
                </Card>

                {selectedDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{bookingDict.selectTime}</CardTitle>
                      <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                    </CardHeader>
                    <CardContent><TimeSlots slots={availableSlots} selectedTime={selectedTime} onTimeSelect={setSelectedTime} loading={slotsLoading} locale={locale} /></CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 3 && (
              <Card>
                <CardHeader><CardTitle>{bookingDict.customerInfo}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">{bookingDict.fullName} *</Label>
                      <div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="name" value={customerData.name} onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))} placeholder={bookingDict.fullNamePlaceholder} className="pl-10" /></div>
                    </div>
                    <div>
                      <Label htmlFor="email">{bookingDict.email} *</Label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="email" type="email" value={customerData.email} onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))} placeholder={bookingDict.emailPlaceholder} className="pl-10" /></div>
                    </div>
                    <div>
                      <Label htmlFor="phone">{bookingDict.phone}</Label>
                      <div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input id="phone" type="tel" value={customerData.phone} onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))} placeholder={bookingDict.phonePlaceholder} className="pl-10" /></div>
                    </div>
                    <div>
                      <Label htmlFor="notes">{bookingDict.notes}</Label>
                      <Textarea id="notes" value={customerData.notes} onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))} placeholder={bookingDict.notesPlaceholder} rows={3} />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={customerData.consent}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, consent: e.target.checked }))}
                          className="mt-1"
                        />
                        <span>{bookingDict.consent}</span>
                      </label>

                      <label className="flex items-start gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={customerData.marketing}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="mt-1"
                        />
                        <span>{bookingDict.marketing}</span>
                      </label>
                    </div>

                    {verificationStep && (
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">{bookingDict.verificationCode}</Label>
                        <Input
                          id="verificationCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          inputMode="numeric"
                          maxLength={6}
                        />
                        <Button type="button" variant="outline" onClick={sendVerificationCode} disabled={sendingCode}>
                          {sendingCode ? `${commonDict.loading}...` : bookingDict.resendCode}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader><CardTitle className="text-lg">{bookingDict.summary}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {selectedServiceIds.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{bookingDict.services}</h4>
                    <div className="space-y-2">
                      {selectedServiceIds.map(serviceId => {
                        const service = services.find(s => s.id === serviceId)
                        const count = serviceCounts[serviceId] || 0
                        return service ? <div key={serviceId} className="flex justify-between text-sm"><span>{service.name} x{count}</span><span>${(Number(service.price || 0) * count).toFixed(2)}</span></div> : null
                      })}
                    </div>
                    <Separator className="my-3" />
                    {(modifierAdjustments.duration !== 0 || modifierAdjustments.price !== 0) && (
                      <>
                        <div className="text-xs text-gray-600 mb-1">{bookingDict.modifiers}:</div>
                        {modifierAdjustments.duration !== 0 && <div className="flex justify-between text-xs text-gray-600"><span>{bookingDict.duration}:</span><span>+{modifierAdjustments.duration} min</span></div>}
                        {modifierAdjustments.price !== 0 && <div className="flex justify-between text-xs text-gray-600"><span>{bookingDict.totalPrice}:</span><span>+${Number(modifierAdjustments.price).toFixed(2)}</span></div>}
                        <Separator className="my-2" />
                      </>
                    )}
                    <div className="flex justify-between font-medium"><span>{bookingDict.duration}: {formatDuration(getTotalDuration())}</span><span>${getTotalPrice().toFixed(2)}</span></div>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <h4 className="font-medium mb-2">{bookingDict.date} & {bookingDict.time}</h4>
                    <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                    {selectedTime && <p className="text-sm text-gray-600">{bookingDict.time}: {selectedTime}</p>}
                  </div>
                )}

                <div className="pt-4">
                  {step === 1 && <Button onClick={() => setStep(2)} disabled={selectedServiceIds.length === 0} className="w-full">{commonDict.next}</Button>}
                  {step === 2 && <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="w-full">{commonDict.next}</Button>}
                  {step === 3 && <Button onClick={handleSubmit} disabled={submitting || sendingCode || !customerData.name || !customerData.email} className="w-full">{submitting || sendingCode ? `${commonDict.loading}...` : verificationStep ? bookingDict.confirmBooking : bookingDict.sendCode}</Button>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
