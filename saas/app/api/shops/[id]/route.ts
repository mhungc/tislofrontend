import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'

// GET /api/shops/[id] - Obtener tienda específica
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shop = await repo.getByIdForOwner(params.id, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en GET /api/shops/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH /api/shops/[id] - Actualizar tienda
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingShop = await repo.getByIdForOwner(params.id, user.id)
    if (!existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const shop = await repo.update(params.id, body)

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error en PATCH /api/shops/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/shops/[id] - Eliminar tienda
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingShop = await repo.getByIdForOwner(params.id, user.id)
    if (!existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    await repo.delete(params.id)
    return NextResponse.json({ message: 'Tienda eliminada correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/shops/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}