import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const where: any = { shop_id: shopId }
    
    if (start && end) {
      where.exception_date = {
        gte: new Date(start),
        lte: new Date(end)
      }
    }

    const exceptions = await prisma.schedule_exceptions.findMany({
      where,
      orderBy: { exception_date: 'asc' }
    })

    return NextResponse.json({ exceptions })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
