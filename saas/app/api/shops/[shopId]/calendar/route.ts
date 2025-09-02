import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { BookingCalendarService } from '@/lib/services/booking-calendar-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Fechas de inicio y fin requeridas' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const bookingRepo = new BookingRepository()
    const scheduleRepo = new ScheduleRepository()
    const calendarService = new BookingCalendarService()

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Obtener datos necesarios
    const [bookings, schedules] = await Promise.all([
      bookingRepo.getByDateRange(shopId, startDate, endDate),
      scheduleRepo.getByShopId(shopId)
    ])

    // Enriquecer reservas con información de servicios
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingWithServices = await bookingRepo.getById(booking.id)
        return {
          ...booking,
          customer_name: booking.customer_name || 'Cliente',
          customer_email: booking.customer_email || '',
          customer_phone: booking.customer_phone || undefined,
          booking_date: booking.booking_date.toISOString().split('T')[0],
          total_duration: booking.total_duration || 0,
          total_price: booking.total_price ? parseFloat(booking.total_price.toString()) : 0,
          status: (booking.status as 'pending' | 'confirmed' | 'cancelled') || 'pending',
          notes: booking.notes || undefined,
          services: bookingWithServices?.booking_services?.map((bs: any) => ({
            name: bs.services?.name || 'Servicio',
            duration_minutes: bs.duration_minutes || 0,
            price: parseFloat(bs.price.toString()) || 0
          })) || []
        }
      })
    )

    // Generar estructura de calendario
    const calendar = calendarService.generateCalendarStructure(
      schedules,
      enrichedBookings,
      startDate,
      endDate
    )

    return NextResponse.json({ 
      calendar,
      shop: {
        id: shop.id,
        name: shop.name,
        address: shop.address
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}