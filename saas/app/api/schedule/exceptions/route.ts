import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { shop_id, exception_date, is_closed, open_time, close_time, reason } = body

    const shopRepo = new ShopRepository()
    const shop = await shopRepo.getByIdForOwner(shop_id, user.id)
    
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const exception = await prisma.schedule_exceptions.create({
      data: {
        shop_id,
        exception_date: new Date(exception_date),
        is_closed,
        open_time: open_time ? open_time : null,
        close_time: close_time ? close_time : null,
        reason: reason || null
      }
    })

    return NextResponse.json({ exception })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
