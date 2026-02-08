import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ exceptionId: string }> }
) {
  try {
    const { exceptionId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que la excepción existe y pertenece a una tienda del usuario
    const exception = await prisma.schedule_exceptions.findUnique({
      where: { id: exceptionId },
      include: { shops: true }
    })

    if (!exception) {
      return NextResponse.json({ error: 'Excepción no encontrada' }, { status: 404 })
    }

    const shopRepo = new ShopRepository()
    const shop = await shopRepo.getByIdForOwner(exception.shop_id, user.id)
    
    if (!shop) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await prisma.schedule_exceptions.delete({
      where: { id: exceptionId }
    })

    return NextResponse.json({ message: 'Excepción eliminada correctamente' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
