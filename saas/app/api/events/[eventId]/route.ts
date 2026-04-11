import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EventRepository } from '@/lib/repositories/event.repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { EventService } from '@/lib/services/event.service'

const eventRepository = new EventRepository()
const shopRepository = new ShopRepository()
const eventService = new EventService()

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function ensureOwnedEvent(eventId: string, ownerId: string) {
  const event = await eventRepository.getEventById(eventId)
  if (!event) {
    return { error: NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 }) }
  }

  const store = await shopRepository.getByIdForOwner(event.store_id, ownerId)
  if (!store) {
    return { error: NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 }) }
  }

  return { event, store }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    if (!uuidRegex.test(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 })
    }

    const event = await eventService.getEventDetails(eventId)
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: error instanceof Error && error.message === 'Evento no encontrado' ? 404 : 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    if (!uuidRegex.test(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ownership = await ensureOwnedEvent(eventId, user.id)
    if (ownership.error) {
      return ownership.error
    }

    const body = await request.json()
    const event = await eventService.updateEvent(eventId, {
      name: body.name,
      description: body.description,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      capacity: body.capacity === undefined ? undefined : Number(body.capacity),
      price: body.price === '' ? null : body.price === undefined ? undefined : body.price === null ? null : Number(body.price)
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    if (!uuidRegex.test(eventId)) {
      return NextResponse.json({ error: 'ID de evento inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ownership = await ensureOwnedEvent(eventId, user.id)
    if (ownership.error) {
      return ownership.error
    }

    await eventService.deleteEvent(eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 400 }
    )
  }
}