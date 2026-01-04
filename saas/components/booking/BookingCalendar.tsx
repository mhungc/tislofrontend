'use client'

import React, { useState, useEffect } from 'react'
import { BookingCalendarService, CalendarDay, CalendarBooking } from '@/lib/services/booking-calendar-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Mail, Phone, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface BookingCalendarProps {
  shopId: string
  shopName: string
}

export function BookingCalendar({ shopId, shopName }: BookingCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  const calendarService = new BookingCalendarService()

  useEffect(() => {
    loadCalendar()
  }, [currentWeek, shopId])

  const loadCalendar = async () => {
    setLoading(true)
    try {
      const startDate = getWeekStart(currentWeek)
      const endDate = getWeekEnd(currentWeek)
      
      const data = await calendarService.getCalendarView(
        shopId,
        formatDate(startDate),
        formatDate(endDate)
      )
      
      setCalendar(data.calendar)
    } catch (error) {
      toast.error('Error al cargar calendario')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking)
    setShowBookingDialog(true)
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await calendarService.updateBookingStatus(shopId, bookingId, status)
      toast.success(`Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`)
      setShowBookingDialog(false)
      loadCalendar()
    } catch (error) {
      toast.error('Error al actualizar reserva')
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const getWeekStart = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    return new Date(start.setDate(diff))
  }

  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date)
    end.setDate(end.getDate() + 6)
    return end
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Generar slots dinámicamente basado en los horarios de la tienda
  const generateTimeSlots = () => {
    const slots = new Set<string>()
    
    calendar.forEach(day => {
      day.slots.forEach(slot => {
        slots.add(slot.time)
      })
    })
    
    return Array.from(slots).sort()
  }
  
  const timeSlots = generateTimeSlots()

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda de Reservas - {shopName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona las reservas de tu tienda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                {formatDisplayDate(formatDate(getWeekStart(currentWeek)))} - {formatDisplayDate(formatDate(getWeekEnd(currentWeek)))}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 border-r bg-gray-50 font-medium text-sm">Hora</div>
            {calendar.map(day => (
              <div key={day.date} className="p-3 border-r bg-gray-50 text-center">
                <div className="font-medium text-sm">{formatDisplayDate(day.date)}</div>
                {!day.isWorkingDay && (
                  <div className="text-xs text-gray-500 mt-1">Cerrado</div>
                )}
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="p-3 border-r bg-gray-50 text-sm font-medium flex items-center">
                  {time}
                </div>
                {calendar.map(day => {
                  const slot = day.slots.find(s => s.time === time)
                  const booking = slot?.booking

                  return (
                    <div key={`${day.date}-${time}`} className="border-r p-1 relative">
                      {booking && (
                        <div
                          onClick={() => handleBookingClick(booking)}
                          className={`
                            p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow
                            ${getStatusColor(booking.status)}
                          `}
                        >
                          <div className="font-medium truncate">{booking.customer_name}</div>
                          <div className="text-xs opacity-75">
                            {booking.start_time} - {booking.end_time}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog isOpen={showBookingDialog} onClose={() => setShowBookingDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status === 'pending' ? 'Pendiente' : 
                   selectedBooking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatDisplayDate(selectedBooking.booking_date)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{selectedBooking.customer_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedBooking.customer_email}</span>
                </div>
                
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedBooking.customer_phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedBooking.start_time} - {selectedBooking.end_time} 
                    ({selectedBooking.total_duration} min)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Servicios:</h4>
                <div className="space-y-1">
                  {selectedBooking.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span>${service.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${selectedBooking.total_price}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium mb-1">Notas:</h4>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    className="flex-1"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}