import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'

// GET /api/shops/:id - Obtener tienda específica
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    const { shopId } = await context.params
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shop = await repo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
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
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    const { shopId } = await context.params
    
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
    const existing = await repo.getByIdForOwner(shopId, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const shop = await repo.update(shopId, {
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

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en PUT /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/shops/:id - Actualizar tienda parcialmente
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    const { shopId } = await context.params
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const existing = await repo.getByIdForOwner(shopId, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const shop = await repo.update(shopId, body)
    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en PATCH /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/shops/:id - Eliminar tienda
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ shopId: string }> }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    const { shopId } = await context.params
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existing = await repo.getByIdForOwner(shopId, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    await repo.delete(shopId)
    return NextResponse.json({ message: 'Tienda eliminada correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/shops/:id:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}