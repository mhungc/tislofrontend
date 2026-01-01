'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { WeeklyScheduleEditor } from '@/components/schedule/WeeklyScheduleEditor'
import { ScheduleViewer } from '@/components/schedule/ScheduleViewer'
import { ServicesList } from '@/components/services/ServicesList'
import { ServiceForm } from '@/components/services/ServiceForm'
import { BookingLinks } from '@/components/booking/BookingLinks'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger,TabsPanels  } from '@/components/ui/tabs'
import { ArrowLeft, Clock, Wrench, Store, Plus, Edit, Link } from 'lucide-react'
import { toast } from 'sonner'

export default function ShopConfigPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = params.shopId as string
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [scheduleMode, setScheduleMode] = useState<'view' | 'edit' | 'create'>('view')
  const [serviceMode, setServiceMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingServiceId, setEditingServiceId] = useState<string | undefined>()
  
  const scheduleService = new ScheduleService()

  useEffect(() => {
    const loadData = async () => {
      const shopParam = searchParams.get('shop')
      
      if (shopParam) {
        try {
          const shopData = JSON.parse(decodeURIComponent(shopParam))
          setShop(shopData)
        } catch (error) {
          console.error('Error al parsear datos de tienda:', error)
        }
      }

      if (!shopParam) {
        try {
          const response = await fetch(`/api/shops/${shopId}`)
          if (response.ok) {
            const data = await response.json()
            setShop(data.shop || data)
          }
        } catch (error) {
          console.error('Error al cargar tienda:', error)
        }
      }

      try {
        const existingSchedules = await scheduleService.getShopSchedules(shopId)
        setSchedules(existingSchedules)
        setScheduleMode(existingSchedules.length > 0 ? 'view' : 'create')
      } catch (error) {
        setScheduleMode('create')
      } finally {
        setLoading(false)
      }
    }

    if (shopId) loadData()
  }, [shopId, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Configuración - {shop?.name}</h1>
        </div>
      </div>

      {shop && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{shop.name}</h2>
                <p className="text-sm text-muted-foreground">{shop.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Configuración completa</p>
                <p className="font-medium">Horarios y servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

     <Tabs defaultValue="schedule" className="space-y-6">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="schedule">
      <Clock className="h-4 w-4 mr-2" />
      Horarios
    </TabsTrigger>
    <TabsTrigger value="services">
      <Wrench className="h-4 w-4 mr-2" />
      Servicios
    </TabsTrigger>
    <TabsTrigger value="booking">
      <Link className="h-4 w-4 mr-2" />
      Reservas
    </TabsTrigger>
  </TabsList>

  {/* AÑADE ESTE WRAPPER */}
  <TabsPanels>
    <TabsContent value="schedule" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gestión de Horarios</h2>
        {scheduleMode === 'view' && schedules.length > 0 && (
          <Button onClick={() => setScheduleMode('edit')} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {scheduleMode === 'view' && schedules.length > 0 ? (
        <ScheduleViewer
          schedules={schedules}
          shopName={shop?.name || 'Tienda'}
          onEdit={() => setScheduleMode('edit')}
          onDelete={async () => {
            try {
              await fetch(`/api/shops/${shopId}/schedule`, { method: 'DELETE' })
              setSchedules([])
              setScheduleMode('create')
              toast.success('Horarios eliminados')
            } catch (error) {
              toast.error('Error al eliminar horarios')
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          <WeeklyScheduleEditor
            shopId={shopId}
            existingSchedules={scheduleMode === 'edit' ? schedules : []}
            onScheduleUpdated={async () => {
              try {
                const updatedSchedules = await scheduleService.getShopSchedules(shopId)
                setSchedules(updatedSchedules)
                setScheduleMode('view')
              } catch (error) {
                console.error('Error al recargar horarios:', error)
              }
            }}
          />
          {scheduleMode === 'edit' && (
            <Button variant="outline" onClick={() => setScheduleMode('view')}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </TabsContent>

    <TabsContent value="services" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gestión de Servicios</h2>
        {serviceMode === 'list' && (
          <Button onClick={() => setServiceMode('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {serviceMode === 'list' ? (
        <ServicesList
          shopId={shopId}
          onServiceEdit={(serviceId) => {
            setEditingServiceId(serviceId)
            setServiceMode('edit')
          }}
          onCreateNew={() => setServiceMode('create')}
        />
      ) : (
        <ServiceForm
          shopId={shopId}
          serviceId={editingServiceId}
          onSuccess={() => {
            setServiceMode('list')
            setEditingServiceId(undefined)
          }}
          onCancel={() => {
            setServiceMode('list')
            setEditingServiceId(undefined)
          }}
        />
      )}
    </TabsContent>

    <TabsContent value="booking" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Enlaces de Reserva</h2>
      </div>

      <BookingLinks shopId={shopId} shopName={shop?.name || 'Tienda'} />
    </TabsContent>
  </TabsPanels>
  {/* FIN DEL WRAPPER */}
</Tabs>
    </div>
  )
}