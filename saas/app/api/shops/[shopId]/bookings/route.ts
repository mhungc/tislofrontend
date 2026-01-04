import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingService } from '@/lib/services/booking-service'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { BookingEmailService } from '@/lib/services/booking-email-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const bookingService = new BookingService()

    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    let bookings
    if (startDate && endDate) {
      bookings = await bookingService.getBookingsByDateRange(shopId, startDate, endDate)
    } else {
      bookings = await bookingService.getBookingsByShop(shopId)
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      start_time,
      end_time,
      service_id,
      notes,
      total_duration,
      total_price
    } = await request.json()

    // Validar datos requeridos
    if (!customer_name || !booking_date || !start_time || !service_id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const bookingRepo = new BookingRepository()

    // Crear reserva
    const booking = await bookingRepo.create(
      {
        shop_id: shopId,
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        start_time,
        end_time,
        total_duration,
        total_price,
        status: 'pending',
        notes
      },
      [{
        service_id,
        price: total_price,
        duration_minutes: total_duration
      }]
    )

    // NO enviar email automáticamente para bookings manuales
    // El administrador debe confirmar la reserva primero

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}