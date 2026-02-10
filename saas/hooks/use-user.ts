'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Debug: Log user metadata to see what's available
          console.log('🔍 User metadata:', {
            email: user.email,
            metadata: user.user_metadata,
            avatar: user.user_metadata?.avatar_url,
            picture: user.user_metadata?.picture
          })

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          console.log('🔍 Profile from DB:', profile)

          if (profile) {
            setProfile(profile)
          } else {
            const newProfile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
            }

            console.log('🔍 Creating new profile:', newProfile)

            const { data: createdProfile } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single()

            setProfile(createdProfile || newProfile)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          getUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      // Limpiar estado local
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error in signOut:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut
  }
}