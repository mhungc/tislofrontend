import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'

const shopRepository = new ShopRepository()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener información de la tienda
    const shop = await shopRepository.getByIdForOwner(shopId, user.id)

    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepository.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Eliminar la tienda (esto eliminará en cascada todos los datos relacionados)
    await shopRepository.delete(shopId)

    return NextResponse.json({ message: 'Tienda eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar tienda:', error)
    return NextResponse.json({ error: 'Error al eliminar la tienda' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const resolvedParams = await params
    const { shopId } = resolvedParams
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const existingShop = await shopRepository.getByIdForOwner(shopId, user.id)
    if (!existingShop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
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
      is_active,
      bookingConfirmationMode
    } = body

    if (
      bookingConfirmationMode !== undefined &&
      !['manual', 'automatic'].includes(bookingConfirmationMode)
    ) {
      return NextResponse.json({ error: 'Modo de confirmación inválido' }, { status: 400 })
    }

    const shop = await shopRepository.update(shopId, {
      name,
      description,
      address,
      phone,
      email,
      website,
      timezone,
      is_active,
      bookingConfirmationMode
    })

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error al actualizar tienda:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}