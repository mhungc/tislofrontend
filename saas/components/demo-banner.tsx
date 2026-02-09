"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DemoBannerProps {
  onToggleDemo?: () => void
}

export function DemoBanner({ onToggleDemo }: DemoBannerProps) {
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkDemoStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsVisible(true)
        try {
          const response = await fetch('/api/auth/profile', {
            method: 'POST'
          })
          if (response.ok) {
            const data = await response.json()
            const demoStatus = data.profile?.is_demo || false
            setIsDemo(demoStatus)
          }
        } catch (error) {
          console.error('Error verificando estado demo:', error)
        }
      }
    }

    checkDemoStatus()
  }, [])

  const handleToggleDemo = async () => {
    if (isDemo && !confirm('¿Estás seguro de que quieres eliminar todos los datos de demostración? Esta acción no se puede deshacer.')) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/demo/toggle', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsDemo(!isDemo)
        onToggleDemo?.()
        
        if (data.action === 'created') {
          alert('¡Datos de demostración cargados! Ahora puedes explorar todas las funcionalidades del sistema.')
          // Recargar la página para mostrar los datos
          window.location.reload()
        } else {
          alert('Datos de demostración eliminados. Ahora puedes configurar tu negocio real.')
          // Recargar la página para limpiar la vista
          window.location.reload()
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Error al cambiar estado demo'}`)
      }
    } catch (error) {
      console.error('Error toggle datos demo:', error)
      alert('Error al cambiar estado de demostración. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className={`mb-6 ${isDemo 
      ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950' 
      : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={isDemo 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }>
              {isDemo ? '🎯 DEMO ACTIVO' : '🚀 EXPLORAR DEMO'}
            </Badge>
            <CardTitle className={isDemo 
              ? 'text-amber-900 dark:text-amber-100'
              : 'text-blue-900 dark:text-blue-100'
            }>
              {isDemo ? 'Datos de Demostración Activos' : 'Explora el Sistema con Datos Demo'}
            </CardTitle>
          </div>
        </div>
        <CardDescription className={isDemo 
          ? 'text-amber-700 dark:text-amber-300'
          : 'text-blue-700 dark:text-blue-300'
        }>
          {isDemo 
            ? 'Estás viendo datos de demostración precargados. Puedes explorar todas las funcionalidades del sistema con estos datos de ejemplo.'
            : 'Carga datos de demostración para explorar todas las funcionalidades del sistema sin configurar nada.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className={`text-sm ${isDemo 
            ? 'text-amber-800 dark:text-amber-200'
            : 'text-blue-800 dark:text-blue-200'
          }`}>
            {isDemo ? (
              <>
                <p className="font-medium mb-1">Salón Bella Vista - Datos Demo</p>
                <p className="text-xs">
                  • Tienda precargada con servicios de belleza<br/>
                  • Horarios configurados<br/>
                  • Reservas de ejemplo para la próxima semana<br/>
                  • Clientes ficticios para pruebas
                </p>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">¿Quieres ver el sistema en acción?</p>
                <p className="text-xs">
                  • Carga automáticamente una tienda de ejemplo<br/>
                  • 9 servicios de belleza precargados<br/>
                  • 5 reservas de demostración<br/>
                  • Horarios y clientes ficticios
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              className={isDemo 
                ? 'border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900'
                : 'border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900'
              }
            >
              Ocultar
            </Button>
            <Button
              variant={isDemo ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleDemo}
              disabled={isLoading}
              className={isDemo 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            >
              {isLoading 
                ? 'Procesando...' 
                : isDemo 
                  ? 'Usar Datos Reales' 
                  : 'Cargar Datos Demo'
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
