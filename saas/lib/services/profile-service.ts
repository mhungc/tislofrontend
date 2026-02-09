import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export class ProfileService {
  async ensureProfileExists(userId: string) {
    // Verificar si ya existe el perfil
    const existingProfile = await prisma.profiles.findUnique({
      where: { id: userId }
    })

    if (existingProfile) {
      return existingProfile
    }

    // Obtener datos del usuario de Supabase Auth
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user || user.id !== userId) {
      throw new Error('Usuario no encontrado en Supabase Auth')
    }

    // Crear el perfil automáticamente usando los metadatos de Supabase
    const profile = await prisma.profiles.create({
      data: {
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  null,
        avatar_url: user.user_metadata?.avatar_url || null,
        is_demo: false
      }
    })

    return profile
  }
}

export const profileService = new ProfileService()