import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/shops/:id - Obtener tienda específica
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener tienda específica
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', params.shopId)
      .eq('owner_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
      }
      console.error('Error al obtener tienda:', error)
      return NextResponse.json({ error: 'Error al obtener tienda' }, { status: 500 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en GET /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/shops/:id - Actualizar tienda completa
export async function PUT(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, email, website, timezone, business_hours, is_active } = body

    // Validar campos requeridos
    if (!name || !address) {
      return NextResponse.json({ 
        error: 'Nombre y dirección son requeridos' 
      }, { status: 400 })
    }

    // Verificar que la tienda pertenece al usuario
    const { data: existingShop, error: checkError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', params.shopId)
      .eq('owner_id', user.id)
      .single()

    if (checkError || !existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Actualizar tienda
    const { data: shop, error } = await supabase
      .from('shops')
      .update({
        name,
        description,
        address,
        phone,
        email,
        website,
        timezone,
        business_hours,
        is_active
      })
      .eq('id', params.shopId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar tienda:', error)
      return NextResponse.json({ error: 'Error al actualizar tienda' }, { status: 500 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en PUT /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/shops/:id - Actualizar tienda parcialmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Verificar que la tienda pertenece al usuario
    const { data: existingShop, error: checkError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', params.shopId)
      .eq('owner_id', user.id)
      .single()

    if (checkError || !existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Actualizar tienda parcialmente
    const { data: shop, error } = await supabase
      .from('shops')
      .update(body)
      .eq('id', params.shopId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar tienda:', error)
      return NextResponse.json({ error: 'Error al actualizar tienda' }, { status: 500 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en PATCH /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/shops/:id - Eliminar tienda
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la tienda pertenece al usuario
    const { data: existingShop, error: checkError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', params.shopId)
      .eq('owner_id', user.id)
      .single()

    if (checkError || !existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Eliminar tienda
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', params.shopId)

    if (error) {
      console.error('Error al eliminar tienda:', error)
      return NextResponse.json({ error: 'Error al eliminar tienda' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tienda eliminada correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}