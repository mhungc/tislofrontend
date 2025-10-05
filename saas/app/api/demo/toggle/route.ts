import { createClient } from '@/lib/supabase/server'
import { DemoSeedingService } from '@/lib/services/demo-seeding.service'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log("executing demo/ api..................");
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const demoSeedingService = new DemoSeedingService()
    
    // Verificar si el usuario ya tiene datos demo
    const isDemo = await demoSeedingService.isUserDemo(user.id)
    
    if (isDemo) {
      // Si ya es demo, limpiar datos demo
      await demoSeedingService.clearDemoDataForUser(user.id)
      
      return NextResponse.json({ 
        success: true, 
        action: 'cleared',
        message: 'Datos demo eliminados exitosamente' 
      })
    } else {
      // Si no es demo, crear datos demo
      await demoSeedingService.seedDemoDataForUser(user.id)
      
      return NextResponse.json({ 
        success: true, 
        action: 'created',
        message: 'Datos demo creados exitosamente' 
      })
    }
  } catch (error) {
    console.error('Error toggle datos demo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
