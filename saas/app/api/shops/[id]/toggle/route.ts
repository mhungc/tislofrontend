import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { NextRequest, NextResponse } from 'next/server'

const shopRepository = new ShopRepository()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const shopId = params.id
    const shop = await shopRepository.getByIdForOwner(shopId, user.id)
    
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const updatedShop = await shopRepository.update(shopId, {
      is_active: !shop.is_active
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Error en PATCH /api/shops/[id]/toggle:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}