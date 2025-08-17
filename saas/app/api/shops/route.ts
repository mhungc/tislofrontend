import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/shops - Listar todas las tiendas del usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener tiendas del usuario
    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener tiendas:', error)
      return NextResponse.json({ error: 'Error al obtener tiendas' }, { status: 500 })
    }

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
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, email, website, timezone, business_hours } = body

    // Validar campos requeridos
    if (!name || !address) {
      return NextResponse.json({ 
        error: 'Nombre y dirección son requeridos' 
      }, { status: 400 })
    }

    // Crear tienda
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        name,
        description,
        address,
        phone,
        email,
        website,
        timezone: timezone || 'America/New_York',
        business_hours: business_hours || {
          monday: { open: '09:00', close: '18:00', is_open: true },
          tuesday: { open: '09:00', close: '18:00', is_open: true },
          wednesday: { open: '09:00', close: '18:00', is_open: true },
          thursday: { open: '09:00', close: '18:00', is_open: true },
          friday: { open: '09:00', close: '18:00', is_open: true },
          saturday: { open: '10:00', close: '16:00', is_open: true },
          sunday: { open: '10:00', close: '16:00', is_open: false }
        },
        owner_id: user.id,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear tienda:', error)
      return NextResponse.json({ error: 'Error al crear tienda' }, { status: 500 })
    }

    return NextResponse.json({ shop }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/shops:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}