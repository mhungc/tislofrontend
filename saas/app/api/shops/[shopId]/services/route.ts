import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { ShopRepository } from '@/lib/repositories/shop-repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shopId)) {
      return NextResponse.json({ error: 'ID de tienda inválido' }, { status: 400 })
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

    // Obtener servicios
    const services = await serviceRepo.getByShopId(shopId)
    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shopId)) {
      return NextResponse.json({ error: 'ID de tienda inválido' }, { status: 400 })
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

    const serviceData = await request.json()
    
    // Validar datos requeridos
    if (!serviceData.name || !serviceData.duration_minutes) {
      return NextResponse.json({ 
        error: 'Nombre y duración son requeridos' 
      }, { status: 400 })
    }

    // Crear servicio
    const service = await serviceRepo.create({
      shop_id: shopId,
      name: serviceData.name,
      description: serviceData.description || null,
      duration_minutes: parseInt(serviceData.duration_minutes),
      price: serviceData.price ? parseFloat(serviceData.price) : null,
      is_active: serviceData.is_active ?? true
    })
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error en POST services:', error)
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 })
  }
}