import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

export async function GET(
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

    // Obtener servicio específico
    const service = await serviceRepo.getByIdForShop(serviceId, shopId)
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
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

    const updateData = await request.json()
    
    // Actualizar servicio
    const service = await serviceRepo.update(serviceId, {
      name: updateData.name,
      description: updateData.description,
      duration_minutes: updateData.duration_minutes ? parseInt(updateData.duration_minutes) : undefined,
      price: updateData.price ? parseFloat(updateData.price) : updateData.price,
      is_active: updateData.is_active
    })
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en PUT service:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}

export async function DELETE(
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

    // Eliminar servicio
    await serviceRepo.delete(serviceId)
    
    return NextResponse.json({ message: 'Servicio eliminado correctamente' })
  } catch (error) {
    console.error('Error en DELETE service:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}