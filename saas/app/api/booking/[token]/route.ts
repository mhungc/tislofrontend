import { NextRequest, NextResponse } from 'next/server'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const linkRepo = new BookingLinkRepository()

    const isValid = await linkRepo.isValidToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 })
    }

    const bookingLink = await linkRepo.getByToken(token)
    
    return NextResponse.json({
      shop: bookingLink?.shops,
      services: bookingLink?.shops?.services || [],
      schedules: bookingLink?.shops?.schedules || []
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}