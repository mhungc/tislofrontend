import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

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
      // Convertir tiempo a DateTime para Prisma (sin zona horaria para evitar conversiones)
      const baseDate = '1970-01-01T'
      const openTime = schedule.open_time.includes('T') ? schedule.open_time : `${baseDate}${schedule.open_time}:00.000`
      const closeTime = schedule.close_time.includes('T') ? schedule.close_time : `${baseDate}${schedule.close_time}:00.000`
      
      return {
        shop_id: shopId,
        day_of_week: schedule.day_of_week,
        open_time: new Date(openTime),
        close_time: new Date(closeTime),
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