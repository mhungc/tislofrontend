"use client";

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, setUser, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }

    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Crear perfil automáticamente
          await fetch('/api/auth/profile', { method: 'POST' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialize, setUser, initialized])

  return <>{children}</>
}