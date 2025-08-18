import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/shops/:shopId/services/:serviceId - Obtener servicio específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shopId: string; serviceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId, serviceId } = await context.params
    
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

    // Obtener servicio específico
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('shop_id', shopId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
      }
      console.error('Error al obtener servicio:', error)
      return NextResponse.json({ error: 'Error al obtener servicio' }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en GET /api/shops/:shopId/services/:serviceId:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/shops/:shopId/services/:serviceId - Actualizar servicio completo
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ shopId: string; serviceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId, serviceId } = await context.params
    
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

    // Verificar que el servicio existe y pertenece a la tienda
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('shop_id', shopId)
      .single()

    if (checkError || !existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Actualizar servicio
    const { data: service, error } = await supabase
      .from('services')
      .update({
        name,
        description,
        duration_minutes,
        price,
        is_active
      })
      .eq('id', serviceId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar servicio:', error)
      return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en PUT /api/shops/:shopId/services/:serviceId:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/shops/:shopId/services/:serviceId - Actualizar servicio parcialmente
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ shopId: string; serviceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId, serviceId } = await context.params
    
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

    // Verificar que el servicio existe y pertenece a la tienda
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('shop_id', shopId)
      .single()

    if (checkError || !existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Actualizar servicio parcialmente
    const { data: service, error } = await supabase
      .from('services')
      .update(body)
      .eq('id', serviceId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar servicio:', error)
      return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en PATCH /api/shops/:shopId/services/:serviceId:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/shops/:shopId/services/:serviceId - Eliminar servicio
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ shopId: string; serviceId: string }> }
) {
  try {
    const supabase = await createClient()
    const { shopId, serviceId } = await context.params
    
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

    // Verificar que el servicio existe y pertenece a la tienda
    const { data: existingService, error: checkError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('shop_id', shopId)
      .single()

    if (checkError || !existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Eliminar servicio
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)

    if (error) {
      console.error('Error al eliminar servicio:', error)
      return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Servicio eliminado correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/shops/:shopId/services/:serviceId:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

