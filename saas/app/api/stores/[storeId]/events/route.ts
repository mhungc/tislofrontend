import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EventService } from '@/lib/services/event.service'
import { ShopRepository } from '@/lib/repositories/shop-repository'

const eventService = new EventService()
const shopRepository = new ShopRepository()

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    if (!uuidRegex.test(storeId)) {
      return NextResponse.json({ error: 'ID de tienda inválido' }, { status: 400 })
    }

    const store = await shopRepository.getById(storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const events = await eventService.getEventsByStore(storeId)
    return NextResponse.json({ events, store })
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params

    if (!uuidRegex.test(storeId)) {
      return NextResponse.json({ error: 'ID de tienda inválido' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const store = await shopRepository.getByIdForOwner(storeId, user.id)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const event = await eventService.createEvent(storeId, {
      name: body.name,
      description: body.description || null,
      date: body.date,
      start_time: body.start_time,
      end_time: body.end_time,
      capacity: Number(body.capacity),
      price: body.price === '' || body.price === null || body.price === undefined ? null : Number(body.price)
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error al crear evento:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 400 }
    )
  }
}