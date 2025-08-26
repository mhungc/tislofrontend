'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { BookingCalendarService, CalendarBooking } from '@/lib/services/booking-calendar-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, User, Mail, Phone, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface BookingCalendarProps {
  shopId: string
  shopName: string
}

export function FullBookingCalendar({ shopId, shopName }: BookingCalendarProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  const calendarService = new BookingCalendarService()

  useEffect(() => {
    if (shopId) {
      loadBookings()
    }
  }, [shopId])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2)
      
      const data = await calendarService.getBookings(
        shopId,
        formatDate(startDate),
        formatDate(endDate)
      )
      
      const calendarEvents = data.bookings.map((booking: CalendarBooking) => ({
        id: booking.id,
        title: `${booking.customer_name}`,
        start: `${booking.booking_date}T${booking.start_time}:00`,
        end: `${booking.booking_date}T${booking.end_time}:00`,
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        textColor: '#ffffff',
        classNames: [`booking-${booking.status}`],
        extendedProps: {
          booking,
          status: booking.status,
          customerEmail: booking.customer_email,
          totalPrice: booking.total_price,
          services: booking.services
        }
      }))
      
      setEvents(calendarEvents)
    } catch (error) {
      toast.error('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps.booking
    setSelectedBooking(booking)
    setShowBookingDialog(true)
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await calendarService.updateBookingStatus(shopId, bookingId, status)
      toast.success(`Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`)
      setShowBookingDialog(false)
      loadBookings()
    } catch (error) {
      toast.error('Error al actualizar reserva')
    }
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e'
      case 'pending': return '#eab308'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!shopId) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Cargando tienda...</h3>
        </CardContent>
      </Card>
    )
  }

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Reservas - {shopName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.8}
            locale="es"
            firstDay={1}
            weekends={true}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:15:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: false
            }}
            allDaySlot={false}
            eventDisplay="block"
            eventMaxStack={3}
            dayMaxEvents={false}
            nowIndicator={true}
            scrollTime="08:00:00"
            scrollTimeReset={false}
            selectable={false}
            selectMirror={false}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '19:00'
            }}
            eventMouseEnter={(info) => {
              info.el.style.cursor = 'pointer'
              info.el.style.opacity = '0.8'
            }}
            eventMouseLeave={(info) => {
              info.el.style.opacity = '1'
            }}
            eventDidMount={(info) => {
              info.el.setAttribute('title', `${info.event.title} - ${info.event.extendedProps.booking?.customer_email || ''}`)
            }}
            dayHeaderFormat={{
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }}
            titleFormat={{
              year: 'numeric',
              month: 'long'
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusBadgeColor(selectedBooking.status)}>
                  {selectedBooking.status === 'pending' ? 'Pendiente' : 
                   selectedBooking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('es-ES')}
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

                <div className="border-t pt-3">
                  <div className="text-sm text-gray-600 mb-2">Servicios:</div>
                  {selectedBooking.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span>${service.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedBooking.total_price}</span>
                </div>

                {selectedBooking.notes && (
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-1">Notas:</div>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

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