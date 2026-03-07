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
      bookingConfirmationMode
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
    })

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