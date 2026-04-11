import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

function toUtcClockIso(value: string | undefined, fallbackHHMM: string) {
  const raw = (value || fallbackHHMM).trim()

  if (raw.includes('T')) {
    if (raw.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(raw)) {
      return raw
    }
    return `${raw}Z`
  }

  return `1970-01-01T${raw}:00.000Z`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const scheduleRepo = new ScheduleRepository()

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Obtener horarios
    const schedules = await scheduleRepo.getByShopId(shopId)
    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const scheduleRepo = new ScheduleRepository()

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const { schedules } = await request.json()
    console.log('Schedules recibidos:', JSON.stringify(schedules, null, 2))
    
    // Preparar horarios para insertar
    const schedulesToInsert = schedules.map((schedule: any) => {
      const openTime = toUtcClockIso(schedule.open_time, '09:00')
      const closeTime = toUtcClockIso(schedule.close_time, '18:00')
      
      return {
        shop_id: shopId,
        day_of_week: schedule.day_of_week,
        open_time: openTime,
        close_time: closeTime,
        is_working_day: schedule.is_working_day ?? true,
        block_order: schedule.block_order ?? 0
      }
    })
    
    console.log('Schedules a insertar:', JSON.stringify(schedulesToInsert, null, 2))

    // Reemplazar horarios usando transacción
    const newSchedules = await scheduleRepo.replaceSchedules(shopId, schedulesToInsert)
    
    return NextResponse.json({ schedules: newSchedules })
  } catch (error) {
    console.error('Error en POST schedule:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const scheduleRepo = new ScheduleRepository()

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Eliminar todos los horarios
    await scheduleRepo.deleteByShopId(shopId)
    
    return NextResponse.json({ message: 'Horarios eliminados correctamente' })
  } catch (error) {
    console.error('Error en DELETE schedule:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}