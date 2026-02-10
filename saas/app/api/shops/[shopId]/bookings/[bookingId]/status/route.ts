import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { BookingEmailService } from '@/lib/services/booking-email-service'

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
    const emailService = new BookingEmailService()

    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const booking = await bookingRepo.getById(bookingId)
    if (!booking || booking.shop_id !== shopId) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    // Actualizar estado de la reserva
    const updatedBooking = await bookingRepo.updateStatus(bookingId, status)

    // Enviar email si el estado cambió a confirmed o cancelled
    if (status === 'confirmed' || status === 'cancelled') {
      // Preparar datos para el email
      const bookingDate = booking.booking_date instanceof Date 
        ? booking.booking_date.toISOString().split('T')[0]
        : booking.booking_date

      const services = booking.booking_services?.map((bs: any) => ({
        name: bs.services?.name || 'Servicio',
        duration_minutes: bs.duration_minutes || 0,
        price: parseFloat(bs.price?.toString() || '0')
      })) || []

      const modifiers = booking.booking_modifiers?.map((mod: any) => ({
        name: mod.service_modifiers?.name || 'Modificador',
        duration_modifier: mod.applied_duration || 0,
        price_modifier: parseFloat(mod.applied_price?.toString() || '0')
      })) || []

      const emailData = {
        customerName: booking.customer_name || 'Cliente',
        customerEmail: booking.customer_email || '',
        bookingDate,
        startTime: booking.start_time,
        endTime: booking.end_time,
        totalDuration: booking.total_duration || 0,
        totalPrice: parseFloat(booking.total_price?.toString() || '0'),
        services,
        modifiers,
        shopName: booking.shops?.name || shop.name,
        shopAddress: booking.shops?.address || shop.address,
        shopPhone: booking.shops?.phone || shop.phone,
        notes: booking.notes || undefined
      }

      // Solo enviar email si hay un email válido
      if (emailData.customerEmail) {
        if (status === 'confirmed') {
          await emailService.sendConfirmationEmail(emailData)
        } else if (status === 'cancelled') {
          await emailService.sendCancellationEmail(emailData)
        }
      }
    }

    return NextResponse.json({ 
      booking: updatedBooking,
      message: `Reserva ${status === 'confirmed' ? 'confirmada' : status === 'cancelled' ? 'cancelada' : 'actualizada'} correctamente`
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}