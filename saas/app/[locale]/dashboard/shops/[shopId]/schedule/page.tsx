'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { WeeklyScheduleEditor } from '@/components/schedule/WeeklyScheduleEditor'
import { ScheduleExceptionsEditor } from '@/components/schedule/ScheduleExceptionsEditor'
import { ScheduleViewer } from '@/components/schedule/ScheduleViewer'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Clock, AlertTriangle, Store, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function ShopSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = params.shopId as string
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view')
  
  const scheduleService = new ScheduleService()

  useEffect(() => {
    const loadData = async () => {
      // Intentar obtener los datos de la tienda desde los parámetros URL
      const shopParam = searchParams.get('shop')
      
      if (shopParam) {
        try {
          const shopData = JSON.parse(decodeURIComponent(shopParam))
          setShop(shopData)
        } catch (error) {
          console.error('Error al parsear datos de tienda:', error)
        }
      }

      // Si no hay datos en URL, hacer fetch como fallback
      if (!shopParam) {
        try {
          const response = await fetch(`/api/shops/${shopId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            setShop(data.shop || data)
          } else if (response.status === 401) {
            router.push('/auth/login')
            return
          }
        } catch (error) {
          console.error('Error al cargar tienda:', error)
        }
      }

      // Cargar horarios existentes
      try {
        const existingSchedules = await scheduleService.getShopSchedules(shopId)
        setSchedules(existingSchedules)
        setMode(existingSchedules.length > 0 ? 'view' : 'create')
      } catch (error) {
        console.error('Error al cargar horarios:', error)
        setMode('create')
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      loadData()
    }
  }, [shopId, router, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          <h1 className="text-2xl font-bold">
            {mode === 'view' ? 'Horarios' : mode === 'edit' ? 'Editar Horarios' : 'Crear Horarios'} - {shop?.name || 'Tienda'}
          </h1>
        </div>
        {mode === 'view' && schedules.length > 0 && (
          <Button onClick={() => setMode('edit')} className="ml-auto">
            <Clock className="h-4 w-4 mr-2" />
            Editar Horarios
          </Button>
        )}
      </div>

      {/* Información de la tienda */}
      {shop && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{shop.name}</h2>
                <p className="text-sm text-muted-foreground">{shop.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Zona horaria</p>
                <p className="font-medium">{shop.timezone || 'America/New_York'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido según el modo */}
      {mode === 'view' && schedules.length > 0 ? (
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horarios Semanales
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Excepciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <ScheduleViewer
              schedules={schedules}
              shopName={shop?.name || 'Tienda'}
              onEdit={() => setMode('edit')}
              onDelete={async () => {
                try {
                  // Eliminar todos los horarios
                  await fetch(`/api/shops/${shopId}/schedule`, {
                    method: 'DELETE',
                    credentials: 'include'
                  })
                  setSchedules([])
                  setMode('create')
                  toast.success('Horarios eliminados correctamente')
                } catch (error) {
                  toast.error('Error al eliminar horarios')
                }
              }}
            />
          </TabsContent>

          <TabsContent value="exceptions">
            <ScheduleExceptionsEditor
              shopId={shopId}
              onExceptionUpdated={() => {}}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {mode === 'create' ? 'Crear Horarios' : 'Editar Horarios'}
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Excepciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <WeeklyScheduleEditor
              shopId={shopId}
              existingSchedules={mode === 'edit' ? schedules : []}
              onScheduleUpdated={async () => {
                // Recargar horarios después de guardar
                try {
                  const updatedSchedules = await scheduleService.getShopSchedules(shopId)
                  setSchedules(updatedSchedules)
                  setMode('view')
                } catch (error) {
                  console.error('Error al recargar horarios:', error)
                }
              }}
            />
            {mode === 'edit' && (
              <div className="mt-4 flex justify-start">
                <Button 
                  variant="outline" 
                  onClick={() => setMode('view')}
                >
                  Cancelar edición
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="exceptions">
            <ScheduleExceptionsEditor
              shopId={shopId}
              onExceptionUpdated={() => {}}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}