import { createClient } from '@/lib/supabase/server'
import { DemoSeedingService } from '@/lib/services/demo-seeding.service'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const demoSeedingService = new DemoSeedingService()
    
    // Verificar que el usuario es demo
    const isDemo = await demoSeedingService.isUserDemo(user.id)
    if (!isDemo) {
      return NextResponse.json({ error: 'Usuario no es demo' }, { status: 403 })
    }

    // Limpiar datos demo
    await demoSeedingService.clearDemoDataForUser(user.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datos demo eliminados exitosamente' 
    })
  } catch (error) {
    console.error('Error eliminando datos demo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
