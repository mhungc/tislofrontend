import { createClient } from '@/lib/supabase/server'
import { profileService } from '@/lib/services/profile-service'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const profile = await profileService.ensureProfileExists(user.id)
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error creando perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}