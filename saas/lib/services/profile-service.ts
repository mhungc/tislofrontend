import { prisma } from '@/lib/prisma'

export class ProfileService {
  async ensureProfileExists(userId: string) {
    // Verificar si ya existe el perfil
    const existingProfile = await prisma.profiles.findUnique({
      where: { id: userId }
    })

    if (existingProfile) {
      return existingProfile
    }

    // Obtener datos del usuario de auth.users
    const user = await prisma.users.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Crear el perfil automáticamente (sin datos demo automáticos)
    const profile = await prisma.profiles.create({
      data: {
        id: userId,
        email: user.email || '',
        full_name: (user.raw_user_meta_data as any)?.full_name || 
                  (user.raw_user_meta_data as any)?.name || 
                  null,
        avatar_url: (user.raw_user_meta_data as any)?.avatar_url || null,
        is_demo: false // Por defecto no es demo
      }
    })

    return profile
  }
}

export const profileService = new ProfileService()