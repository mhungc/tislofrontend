'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WeeklyScheduleEditor } from './WeeklyScheduleEditor'
import { ScheduleExceptionsEditor } from './ScheduleExceptionsEditor'
import { ScheduleViewer } from './ScheduleViewer'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsPanels } from '@/components/ui/tabs'
import { ArrowLeft, Clock, AlertTriangle, Store } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface ShopSchedulePageClientProps {
  shopId: string
  locale: Locale
  dict: Dictionary
}

export function ShopSchedulePageClient({ shopId, locale, dict }: ShopSchedulePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view')

  const scheduleService = new ScheduleService()
  const scheduleDict = dict.schedule
  const isEnglish = locale === 'en'
  const isOnboarding = searchParams.get('onboarding') === '1'

  const navigateToServices = () => {
    const shopParam = shop ? `&shop=${encodeURIComponent(JSON.stringify(shop))}` : ''
    router.push(`/${locale}/dashboard/shops/${shopId}/services?onboarding=1${shopParam}`)
  }

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
          const response = await fetch(`/api/shops/${shopId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json()
              setShop(data.shop || data)
            }
          } else if (response.status === 401) {
            router.push(`/${locale}/auth/login`)
            return
          }
        } catch (error) {
          console.error('Error al cargar tienda:', error)
        }
      }

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
  }, [shopId, router, searchParams, locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const title = mode === 'view'
    ? scheduleDict.title
    : mode === 'edit'
      ? scheduleDict.page.editTitle
      : scheduleDict.page.createTitle

  return (
    <div className="space-y-6">
      {isOnboarding && (
        <Card className="border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-sky-700 mb-1">
                  {isEnglish ? 'Guided setup • Step 2 of 3' : 'Configuración guiada • Paso 2 de 3'}
                </p>
                <h2 className="text-lg font-semibold">
                  {isEnglish
                    ? 'Define your availability schedule'
                    : 'Define tu horario de disponibilidad'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEnglish
                    ? 'After saving, we take you directly to service setup.'
                    : 'Después de guardar, te llevamos directo a configurar servicios.'}
                </p>
              </div>
              {schedules.length > 0 && mode === 'view' && (
                <Button onClick={navigateToServices}>
                  {isEnglish ? 'Continue to Services' : 'Continuar a Servicios'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {scheduleDict.page.back}
        </Button>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          <h1 className="text-2xl font-bold">
            {title} - {shop?.name || scheduleDict.page.shopFallback}
          </h1>
        </div>
        {mode === 'view' && schedules.length > 0 && (
          <Button onClick={() => setMode('edit')} className="ml-auto">
            <Clock className="h-4 w-4 mr-2" />
            {scheduleDict.page.editButton}
          </Button>
        )}
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
                <p className="text-sm text-muted-foreground">{scheduleDict.page.timezone}</p>
                <p className="font-medium">{shop.timezone || 'America/New_York'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'view' && schedules.length > 0 ? (
        <Tabs defaultValue="0" className="space-y-6">
          <TabsList>
            <TabsTrigger className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {scheduleDict.page.weeklyTab}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {scheduleDict.page.exceptionsTab}
            </TabsTrigger>
          </TabsList>

          <TabsPanels>
            <TabsContent>
              <ScheduleViewer
                schedules={schedules}
                shopName={shop?.name || scheduleDict.page.shopFallback}
                locale={locale}
                scheduleDict={scheduleDict}
                onEdit={() => setMode('edit')}
                onDelete={async () => {
                  try {
                    await fetch(`/api/shops/${shopId}/schedule`, {
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    setSchedules([])
                    setMode('create')
                    toast.success(scheduleDict.page.deleteSuccess)
                  } catch (error) {
                    toast.error(scheduleDict.page.deleteError)
                  }
                }}
              />
            </TabsContent>

            <TabsContent>
              <ScheduleExceptionsEditor
                shopId={shopId}
                locale={locale}
                scheduleDict={scheduleDict}
                onExceptionUpdated={() => {}}
              />
            </TabsContent>
          </TabsPanels>
        </Tabs>
      ) : (
        <Tabs defaultValue="0" className="space-y-6">
          <TabsList>
            <TabsTrigger className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {mode === 'create' ? scheduleDict.page.createTitle : scheduleDict.page.editTitle}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {scheduleDict.page.exceptionsTab}
            </TabsTrigger>
          </TabsList>

          <TabsPanels>
            <TabsContent>
              <WeeklyScheduleEditor
                shopId={shopId}
                locale={locale}
                scheduleDict={scheduleDict}
                existingSchedules={mode === 'edit' ? schedules : []}
                onScheduleSaved={() => {
                  if (!isOnboarding) return
                  toast.success(
                    isEnglish
                      ? 'Schedule saved. Next step: add your services.'
                      : 'Horario guardado. Siguiente paso: agrega tus servicios.'
                  )
                  setTimeout(() => {
                    navigateToServices()
                  }, 800)
                }}
                onScheduleUpdated={async () => {
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
                  <Button variant="outline" onClick={() => setMode('view')}>
                    {scheduleDict.page.cancelEdit}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent>
              <ScheduleExceptionsEditor
                shopId={shopId}
                locale={locale}
                scheduleDict={scheduleDict}
                onExceptionUpdated={() => {}}
              />
            </TabsContent>
          </TabsPanels>
        </Tabs>
      )}
    </div>
  )
}
