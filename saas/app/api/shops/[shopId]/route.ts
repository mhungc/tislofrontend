import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'

const shopRepository = new ShopRepository()
const scheduleRepository = new ScheduleRepository()

const dayMap = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
] as const

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

    const schedules = await scheduleRepository.getByShopId(shopId)

    const defaultBusinessHours = {
      monday: { open: '09:00', close: '18:00', is_open: true },
      tuesday: { open: '09:00', close: '18:00', is_open: true },
      wednesday: { open: '09:00', close: '18:00', is_open: true },
      thursday: { open: '09:00', close: '18:00', is_open: true },
      friday: { open: '09:00', close: '18:00', is_open: true },
      saturday: { open: '10:00', close: '16:00', is_open: true },
      sunday: { open: '10:00', close: '16:00', is_open: false }
    }

    const business_hours = dayMap.reduce((acc, day, idx) => {
      const daySchedules = schedules.filter((s) => s.day_of_week === idx)
      if (daySchedules.length === 0) {
        acc[day] = {
          open: defaultBusinessHours[day].open,
          close: defaultBusinessHours[day].close,
          is_open: false
        }
        return acc
      }

      const working = daySchedules.filter((s) => s.is_working_day !== false)
      if (working.length === 0) {
        acc[day] = {
          open: defaultBusinessHours[day].open,
          close: defaultBusinessHours[day].close,
          is_open: false
        }
        return acc
      }

      const parseHHMM = (value: Date | string) => {
        if (value instanceof Date) {
          return `${value.getUTCHours().toString().padStart(2, '0')}:${value.getUTCMinutes().toString().padStart(2, '0')}`
        }

        const str = String(value)
        if (str.includes('T')) {
          const time = str.split('T')[1]?.slice(0, 5)
          return time || defaultBusinessHours[day].open
        }
        return str.slice(0, 5)
      }

      const times = working.map((s) => ({
        open: parseHHMM(s.open_time),
        close: parseHHMM(s.close_time)
      }))

      const earliestOpen = times.map((t) => t.open).sort()[0]
      const latestClose = times.map((t) => t.close).sort().reverse()[0]

      acc[day] = {
        open: earliestOpen,
        close: latestClose,
        is_open: true
      }
      return acc
    }, {} as Record<typeof dayMap[number], { open: string; close: string; is_open: boolean }>)

    return NextResponse.json({ shop: { ...shop, business_hours } })
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
          open_time: bh?.open ? `1970-01-01T${bh.open}:00.000Z` : `1970-01-01T09:00:00.000Z`,
          close_time: bh?.close ? `1970-01-01T${bh.close}:00.000Z` : `1970-01-01T18:00:00.000Z`,
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