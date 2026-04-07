import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'

const shopRepository = new ShopRepository()
const scheduleRepository = new ScheduleRepository()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener información de la tienda
    const shop = await shopRepository.getByIdForOwner(shopId, user.id)

    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepository.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Eliminar la tienda (esto eliminará en cascada todos los datos relacionados)
    await shopRepository.delete(shopId)

    return NextResponse.json({ message: 'Tienda eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar tienda:', error)
    return NextResponse.json({ error: 'Error al eliminar la tienda' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingShop = await shopRepository.getByIdForOwner(shopId, user.id)
    if (!existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }


    const body = await request.json()
    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      timezone,
      is_active,
      bookingConfirmationMode,
      base_slot_minutes,
      buffer_minutes,
      business_hours
    } = body

    if (
      bookingConfirmationMode !== undefined &&
      !['manual', 'automatic'].includes(bookingConfirmationMode)
    ) {
      return NextResponse.json({ error: 'Modo de confirmación inválido' }, { status: 400 })
    }

    // Validar base_slot_minutes si viene en el body
    let slotMinutes: number | undefined = undefined
    if (base_slot_minutes !== undefined) {
      if (
        typeof base_slot_minutes !== 'number' ||
        !Number.isInteger(base_slot_minutes) ||
        base_slot_minutes < 5 ||
        base_slot_minutes > 60
      ) {
        return NextResponse.json({
          error: 'base_slot_minutes debe ser un número entre 5 y 60'
        }, { status: 400 })
      }
      slotMinutes = base_slot_minutes
    }
    // Validar buffer_minutes si viene en el body
    let bufferMinutes: number | undefined = undefined
    if (buffer_minutes !== undefined) {
      if (
        typeof buffer_minutes !== 'number' ||
        !Number.isInteger(buffer_minutes) ||
        buffer_minutes < 0 ||
        buffer_minutes > 60
      ) {
        return NextResponse.json({
          error: 'buffer_minutes debe ser un número entre 0 y 60'
        }, { status: 400 })
      }
      bufferMinutes = buffer_minutes
    }

    const shop = await shopRepository.update(shopId, {
      name,
      description,
      address,
      phone,
      email,
      website,
      timezone,
      is_active,
      bookingConfirmationMode,
      ...(slotMinutes !== undefined ? { base_slot_minutes: slotMinutes } : {}),
      ...(bufferMinutes !== undefined ? { buffer_minutes: bufferMinutes } : {})
    })

    // Sync weekly schedules when business_hours is provided from ShopForm
    if (business_hours && typeof business_hours === 'object') {
      const dayMap = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ]

      const schedules = dayMap.map((day, idx) => {
        const bh = business_hours[day]
        return {
          shop_id: shopId,
          day_of_week: idx,
          open_time: bh?.open ? `1970-01-01T${bh.open}:00.000` : `1970-01-01T09:00:00.000`,
          close_time: bh?.close ? `1970-01-01T${bh.close}:00.000` : `1970-01-01T18:00:00.000`,
          is_working_day: bh?.is_open ?? false,
          block_order: 0
        }
      })

      await scheduleRepository.replaceSchedules(shopId, schedules)
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error al actualizar tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}