import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ShopRepository } from '@/lib/repositories/shop-repository'

// GET /api/shops - Listar todas las tiendas del usuario
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener tiendas del usuario via Prisma
    const shops = await repo.listByOwner(user.id)
    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error en GET /api/shops:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/shops - Crear nueva tienda
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ShopRepository()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, address, phone, email, website, timezone } = body

    // Validar campos requeridos
    if (!name || !address || !email) {
      return NextResponse.json({ 
        error: 'Nombre, dirección y email son requeridos' 
      }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Email inválido' 
      }, { status: 400 })
    }

    const shop = await repo.create({
      owner_id: user.id,
      name,
      description,
      address,
      phone,
      email,
      website,
      timezone,
    })

    return NextResponse.json({ shop }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/shops:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}