'use client'

import React, { useState, useEffect } from 'react'
import { BookingCalendarService, CalendarBooking } from '@/lib/services/booking-calendar-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, User, Mail, Phone, Check, X, Clock, ChevronRight, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface MobileBookingListProps {
  shopId: string
  shopName: string
}

export function MobileBookingList({ shopId, shopName }: MobileBookingListProps) {
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const calendarService = new BookingCalendarService()

  useEffect(() => {
    if (shopId) {
      loadBookings()
    }
  }, [shopId, dateRange])

  const getDateRange = () => {
    const today = new Date()
    let startDate = new Date(today)
    let endDate = new Date(today)

    switch (dateRange) {
      case 'today':
        // Solo hoy
        break
      case 'week':
        // Próximos 7 días
        endDate.setDate(endDate.getDate() + 6)
        break
      case 'month':
        // Próximos 30 días
        endDate.setDate(endDate.getDate() + 29)
        break
    }

    return { startDate, endDate }
  }

  const loadBookings = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange()
      
      const data = await calendarService.getBookings(
        shopId,
        formatDate(startDate),
        formatDate(endDate)
      )
      
      setBookings(data.bookings)
    } catch (error) {
      toast.error('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  })

  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = booking.booking_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(booking)
    return groups
  }, {} as Record<string, CalendarBooking[]>)

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
    <div className="space-y-4">
      {/* Filtros móviles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservas - {shopName}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadBookings}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Período</label>
              <Select value={dateRange} onValueChange={(value: 'today' | 'week' | 'month') => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Solo hoy</SelectItem>
                  <SelectItem value="week">Próximos 7 días</SelectItem>
                  <SelectItem value="month">Próximos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      {Object.keys(groupedBookings).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay reservas</h3>
            <p className="text-muted-foreground">
              No se encontraron reservas para los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedBookings)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dayBookings]) => {
            const bookingDate = new Date(date + 'T00:00:00')
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            let dateLabel = bookingDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            
            // Agregar etiquetas relativas
            if (bookingDate.toDateString() === today.toDateString()) {
              dateLabel = `Hoy - ${bookingDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}`
            } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
              dateLabel = `Mañana - ${bookingDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}`
            }
            
            return (
              <Card key={date}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{dateLabel}</span>
                    <Badge variant="outline" className="text-xs">
                      {dayBookings.length} reserva{dayBookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-3">
                {dayBookings
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowBookingDialog(true)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getStatusBadgeColor(booking.status)} text-xs`}>
                            {getStatusText(booking.status)}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.start_time} - {booking.end_time}
                          </span>
                        </div>
                        <div className="font-medium text-sm truncate">
                          {booking.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {booking.services.map(s => s.name).join(', ')}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ${booking.total_price}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  ))}
              </CardContent>
              </Card>
            )
          })
      )}

      {/* Dialog de detalles */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusBadgeColor(selectedBooking.status)}>
                  {getStatusText(selectedBooking.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('es-ES')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium">{selectedBooking.customer_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm break-all">{selectedBooking.customer_email}</span>
                </div>
                
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{selectedBooking.customer_phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm">{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="text-sm text-gray-600 mb-2">Servicios:</div>
                  {selectedBooking.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span className="flex-1">{service.name}</span>
                      <span className="font-medium">${service.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-base font-medium border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${selectedBooking.total_price}</span>
                </div>

                {selectedBooking.notes && (
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-1">Notas:</div>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    className="w-full"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar Reserva
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Reserva
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