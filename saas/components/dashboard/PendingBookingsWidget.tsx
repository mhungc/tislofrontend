'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Check, X, AlertCircle } from 'lucide-react'
import { BookingCalendarService, CalendarBooking } from '@/lib/services/booking-calendar-service'
import { toast } from 'sonner'
import { useShopStore } from '@/lib/stores/shop-store'

export function PendingBookingsWidget() {
  const [pendingBookings, setPendingBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const { shops, selectedShop, loadShops } = useShopStore()
  const calendarService = new BookingCalendarService()

  useEffect(() => {
    if (shops.length === 0) {
      loadShops()
    }
  }, [loadShops, shops.length])

  useEffect(() => {
    const shopId = selectedShop?.id || (shops.length > 0 ? shops[0].id : null)
    if (shopId) {
      loadPendingBookings(shopId)
    }
  }, [selectedShop?.id, shops])

  const loadPendingBookings = async (shopId: string) => {
    const targetShopId = shopId
    if (!targetShopId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const today = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7) // Próximos 7 días

      const data = await calendarService.getBookings(
        targetShopId,
        formatDate(today),
        formatDate(endDate)
      )

      // Filtrar solo pendientes y ordenar por fecha/hora
      const pending = data.bookings
        .filter((b: CalendarBooking) => b.status === 'pending')
        .sort((a: CalendarBooking, b: CalendarBooking) => {
          const dateCompare = a.booking_date.localeCompare(b.booking_date)
          if (dateCompare !== 0) return dateCompare
          return a.start_time.localeCompare(b.start_time)
        })
        .slice(0, 5) // Máximo 5 para el widget

      setPendingBookings(pending)
    } catch (error) {
      console.error('Error loading pending bookings:', error)
      toast.error('Error al cargar reservas pendientes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled', shopId: string) => {
    try {
      await calendarService.updateBookingStatus(shopId, bookingId, status)
      toast.success(`Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`)
      loadPendingBookings(shopId)
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

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana'
    } else {
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    }
  }

  const currentShopId = selectedShop?.id || (shops.length > 0 ? shops[0].id : null)

  if (!currentShopId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Reservas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Selecciona una tienda para ver las reservas pendientes
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Reservas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (pendingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Reservas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Check className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              ¡Todo al día!
            </p>
            <p className="text-xs text-muted-foreground">
              No hay reservas pendientes de confirmar
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Reservas Pendientes
          </CardTitle>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {pendingBookings.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingBookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-600">
                      {formatDisplayDate(booking.booking_date)}
                    </span>
                    <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0 ml-2" />
                    <span className="text-xs text-gray-500">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {booking.customer_name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate ml-5">
                    {booking.services.map(s => s.name).join(', ')}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed', currentShopId)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled', currentShopId)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {pendingBookings.length >= 5 && (
          <div className="mt-4 pt-3 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => window.location.href = '/dashboard/bookings'}
            >
              Ver todas las reservas pendientes →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

