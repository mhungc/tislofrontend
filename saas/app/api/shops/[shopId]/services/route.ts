import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/shops/:shopId/services - Listar servicios de la tienda
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId } = await context.params
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la tienda pertenece al usuario
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shopId)
      .eq('owner_id', user.id)
      .single()

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Obtener servicios de la tienda
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener servicios:', error)
      return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 })
    }

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error en GET /api/shops/:shopId/services:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/shops/:shopId/services - Crear nuevo servicio
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId } = await context.params
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la tienda pertenece al usuario
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shopId)
      .eq('owner_id', user.id)
      .single()

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, duration_minutes, price, is_active } = body

    // Validar campos requeridos
    if (!name || !duration_minutes || price === undefined) {
      return NextResponse.json({ 
        error: 'Nombre, duración y precio son requeridos' 
      }, { status: 400 })
    }

    // Crear servicio
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name,
        description,
        duration_minutes,
        price,
        is_active: is_active !== undefined ? is_active : true,
        shop_id: shopId
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear servicio:', error)
      return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/shops/:shopId/services:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}