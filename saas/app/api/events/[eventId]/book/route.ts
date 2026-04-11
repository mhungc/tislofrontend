import { NextRequest, NextResponse } from 'next/server'
import { EventService } from '@/lib/services/event.service'

const eventService = new EventService()

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    if (!uuidRegex.test(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 })
    }

    const body = await request.json()
    const result = await eventService.bookEvent(eventId, Number(body.spots_reserved), {
      customer_name: body.customer_name,
      customer_email: body.customer_email
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error al reservar evento:', error)
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    const status = message === 'Evento no encontrado'
      ? 404
      : message === 'No hay suficientes plazas disponibles'
        ? 409
        : 400

    return NextResponse.json({ error: message }, { status })
  }
}