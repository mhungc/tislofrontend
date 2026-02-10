import { NextRequest, NextResponse } from 'next/server'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceIds = searchParams.get('services')?.split(',').filter(Boolean) || []
    const additionalDuration = parseInt(searchParams.get('additionalDuration') || '0', 10)

    if (!date) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })
    }

    const linkRepo = new BookingLinkRepository()
    const bookingRepo = new BookingRepository()

    const isValid = await linkRepo.isValidToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 })
    }

    const bookingLink = await linkRepo.getByToken(token)
    if (!bookingLink?.shops) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Calcular duración total de servicios seleccionados + modificadores
    let totalDuration = 60 // Default 1 hora
    if (serviceIds.length > 0) {
      const serviceLookup = new Map(
        bookingLink.shops.services.map(service => [service.id, service])
      )

      totalDuration = serviceIds.reduce((sum, serviceId) => {
        const service = serviceLookup.get(serviceId)
        return sum + (service?.duration_minutes || 0)
      }, 0)
      
      // Agregar duración adicional de modificadores
      totalDuration += additionalDuration
    }
    
    const slots = await bookingRepo.getAvailableSlots(
      bookingLink.shops.id,
      date,
      bookingLink.shops.schedules,
      totalDuration
    )
    
    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}