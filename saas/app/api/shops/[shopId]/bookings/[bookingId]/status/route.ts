import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string; bookingId: string }> }
) {
  try {
    const { shopId, bookingId } = await params
    const { status } = await request.json()

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const bookingRepo = new BookingRepository()

    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const booking = await bookingRepo.getById(bookingId)
    if (!booking || booking.shop_id !== shopId) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    const updatedBooking = await bookingRepo.updateStatus(bookingId, status)

    return NextResponse.json({ 
      booking: updatedBooking,
      message: `Reserva ${status === 'confirmed' ? 'confirmada' : status === 'cancelled' ? 'cancelada' : 'actualizada'} correctamente`
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}