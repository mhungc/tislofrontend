"use client";

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ProfileInitializer() {
  useEffect(() => {
    const initializeProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        try {
          await fetch('/api/auth/profile', { method: 'POST' })
        } catch (error) {
          console.error('Error inicializando perfil:', error)
        }
      }
    }

    initializeProfile()
  }, [])

  return null
}