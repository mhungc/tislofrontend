import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'

// GET /api/shops - Listar todas las tiendas del usuario
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener tiendas del usuario via Prisma
    const shops = await repo.listByOwner(user.id)
    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error en GET /api/shops:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/shops - Crear nueva tienda
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
      bookingConfirmationMode,
      base_slot_minutes,
      buffer_minutes,
      business_hours
    } = body

    // Validar campos requeridos
    if (!name || !address || !email) {
      return NextResponse.json({ 
        error: 'Nombre, dirección y email son requeridos' 
      }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Email inválido' 
      }, { status: 400 })
    }

    if (
      bookingConfirmationMode &&
      !['manual', 'automatic'].includes(bookingConfirmationMode)
    ) {
      return NextResponse.json({
        error: 'Modo de confirmación inválido'
      }, { status: 400 })
    }

    // Validar base_slot_minutes
    let slotMinutes = 15
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

    // Validar buffer_minutes
    let bufferMinutes = 0
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


    // Crear la tienda primero
    const shop = await repo.create({
      owner_id: user.id,
      name,
      description,
      address,
      phone,
      email,
      website,
      timezone,
      bookingConfirmationMode,
      base_slot_minutes: slotMinutes,
      buffer_minutes: bufferMinutes
    })

    // Crear horarios base automáticamente si business_hours está presente
    if (business_hours && typeof business_hours === 'object') {
      // Mapear días a day_of_week (0=domingo, 6=sábado)
      const dayMap = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ]
      const schedules = dayMap.map((day, idx) => {
        const bh = business_hours[day]
        return {
          shop_id: shop.id,
          day_of_week: idx,
          open_time: bh?.open ? `1970-01-01T${bh.open}:00.000` : `1970-01-01T09:00:00.000`,
          close_time: bh?.close ? `1970-01-01T${bh.close}:00.000` : `1970-01-01T18:00:00.000`,
          is_working_day: bh?.is_open ?? false,
          block_order: 0
        }
      })
      // Importar y usar ScheduleRepository
      const { ScheduleRepository } = await import('@/lib/repositories/schedule-repository')
      const scheduleRepo = new ScheduleRepository()
      await scheduleRepo.createMany(schedules)
    }

    // Auto-crear booking link para la nueva tienda (válido por 365 días)
    try {
      const linkRepo = new BookingLinkRepository()
      const bookingLink = await linkRepo.create(shop.id, 365)
      
      // Generar URL completa
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                     process.env.NEXT_PUBLIC_APP_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? 'https://tu-app.vercel.app' 
                       : 'http://localhost:3000')
      
      const bookingUrl = `${baseUrl}/book/${bookingLink.token}`
      
      return NextResponse.json({ 
        shop, 
        bookingLink: {
          ...bookingLink,
          url: bookingUrl
        }
      }, { status: 201 })
    } catch (linkError) {
      // Si falla la creación del link, aún retornamos la tienda
      console.error('Error creating booking link:', linkError)
      return NextResponse.json({ shop }, { status: 201 })
    }
  } catch (error) {
    console.error('Error en POST /api/shops:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}