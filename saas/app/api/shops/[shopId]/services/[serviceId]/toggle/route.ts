import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string; serviceId: string }> }
) {
  try {
    const { shopId, serviceId } = await params
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shopId) || !uuidRegex.test(serviceId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const shopRepo = new ShopRepository()
    const serviceRepo = new ServiceRepository()

    // Verificar que la tienda pertenece al usuario
    const shop = await shopRepo.getByIdForOwner(shopId, user.id)
    if (!shop) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Verificar que el servicio existe y pertenece a la tienda
    const existingService = await serviceRepo.getByIdForShop(serviceId, shopId)
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Cambiar estado del servicio
    const service = await serviceRepo.toggleActive(serviceId)
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en PATCH toggle service:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}