import { NextRequest, NextResponse } from 'next/server'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { ModifierService } from '@/lib/services/modifier-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const linkRepo = new BookingLinkRepository()
    const bookingRepo = new BookingRepository()
    const serviceRepo = new ServiceRepository()

    const isValid = await linkRepo.isValidToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 })
    }

    const bookingLink = await linkRepo.getByToken(token)
    if (!bookingLink?.shops) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      start_time,
      services: serviceIds,
      notes,
      modifiers: modifierIds = []
    } = await request.json()

    // Validar datos requeridos
    if (!customer_name || !customer_email || !booking_date || !start_time || !serviceIds?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Obtener servicios seleccionados
    const services = await Promise.all(
      serviceIds.map((id: string) => serviceRepo.getByIdForShop(id, bookingLink.shops!.id))
    )

    const validServices = services.filter(Boolean)
    if (validServices.length !== serviceIds.length) {
      return NextResponse.json({ error: 'Algunos servicios no son válidos' }, { status: 400 })
    }

    // Obtener modificadores si se proporcionaron
    const modifierService = new ModifierService()
    let appliedModifiers: any[] = []
    let modifierDurationAdjustment = 0
    let modifierPriceAdjustment = 0

    if (modifierIds.length > 0) {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        appliedModifiers = await Promise.all(
          modifierIds.map(async (id: string) => {
            const { data } = await supabase
              .from('service_modifiers')
              .select('*')
              .eq('id', id)
              .single()
            return data
          })
        )
        
        modifierDurationAdjustment = appliedModifiers.reduce((sum, mod) => sum + (mod?.duration_modifier || 0), 0)
        modifierPriceAdjustment = appliedModifiers.reduce((sum, mod) => sum + (mod?.price_modifier || 0), 0)
      } catch (error) {
        console.warn('Error loading modifiers:', error)
      }
    }

    // Calcular duración y precio total (incluyendo modificadores)
    const baseDuration = validServices.reduce((sum, service) => sum + service.duration_minutes, 0)
    const basePrice = validServices.reduce((sum, service) => sum + (service.price || 0), 0)
    const totalDuration = baseDuration + modifierDurationAdjustment
    const totalPrice = basePrice + modifierPriceAdjustment

    // Calcular hora de fin
    const [hours, minutes] = start_time.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + totalDuration * 60000)
    const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Crear reserva
    const booking = await bookingRepo.create(
      {
        shop_id: bookingLink.shops.id,
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        start_time,
        end_time,
        total_duration: totalDuration,
        total_price: totalPrice,
        status: 'pending',
        notes
      },
      validServices.map(service => ({
        service_id: service.id,
        price: service.price || 0,
        duration_minutes: service.duration_minutes
      })),
      appliedModifiers.map(modifier => ({
        service_modifier_id: modifier.id,
        applied_duration: modifier.duration_modifier || 0,
        applied_price: modifier.price_modifier || 0
      }))
    )

    // Incrementar uso del enlace
    await linkRepo.incrementUse(token)

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}