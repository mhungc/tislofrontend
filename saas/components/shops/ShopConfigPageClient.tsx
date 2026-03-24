'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WeeklyScheduleEditor } from '@/components/schedule/WeeklyScheduleEditor'
import { ScheduleViewer } from '@/components/schedule/ScheduleViewer'
import { ServicesList } from '@/components/services/ServicesList'
import { ServiceForm } from '@/components/services/ServiceForm'
import { BookingLinks } from '@/components/booking/BookingLinks'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsPanels } from '@/components/ui/tabs'
import { ArrowLeft, Clock, Wrench, Store, Plus, Edit, Link } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface ShopConfigPageClientProps {
  shopId: string
  locale: Locale
  dict: Dictionary
}

export default function ShopConfigPageClient({ shopId, locale, dict }: ShopConfigPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])
  const [scheduleMode, setScheduleMode] = useState<'view' | 'edit' | 'create'>('view')
  const [serviceMode, setServiceMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingServiceId, setEditingServiceId] = useState<string | undefined>()
  // NUEVO: edición de franja y buffer
  const [editingGeneral, setEditingGeneral] = useState(false)
  const [pendingBaseSlot, setPendingBaseSlot] = useState<number | null>(null)
  const [pendingBuffer, setPendingBuffer] = useState<number | null>(null)

  const scheduleService = new ScheduleService()
  const scheduleDict = dict.schedule

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

                  {/* NUEVO: Configuración de franja horaria y buffer */}
                  <div className="pt-4 border-t space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor="shop-base-slot-minutes" className="block font-medium mb-1">Duración mínima de franja horaria</label>
                        {editingGeneral ? (
                          <select
                            id="shop-base-slot-minutes"
                            value={pendingBaseSlot ?? shop?.base_slot_minutes ?? 15}
                            onChange={e => setPendingBaseSlot(Number(e.target.value))}
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value={5}>5 minutos</option>
                            <option value={10}>10 minutos</option>
                            <option value={15}>15 minutos</option>
                            <option value={20}>20 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>60 minutos</option>
                          </select>
                        ) : (
                          <div className="mt-1 text-base">{shop?.base_slot_minutes ?? 15} minutos</div>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">
                          Intervalo base con el que se generan los huecos disponibles en tu agenda.
                        </span>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="shop-buffer-minutes" className="block font-medium mb-1">Buffer entre reservas</label>
                        {editingGeneral ? (
                          <select
                            id="shop-buffer-minutes"
                            value={pendingBuffer ?? shop?.buffer_minutes ?? 0}
                            onChange={e => setPendingBuffer(Number(e.target.value))}
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value={0}>Sin buffer (citas consecutivas)</option>
                            <option value={5}>5 minutos</option>
                            <option value={10}>10 minutos</option>
                            <option value={15}>15 minutos</option>
                            <option value={20}>20 minutos</option>
                          </select>
                        ) : (
                          <div className="mt-1 text-base">{shop?.buffer_minutes ?? 0} minutos</div>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">
                          Tiempo extra que se deja libre después de cada reserva para limpieza, preparación, etc.
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {editingGeneral ? (
                        <>
                          <Button
                            size="sm"
                            onClick={async () => {
                              const base_slot_minutes = pendingBaseSlot ?? shop?.base_slot_minutes ?? 15
                              const buffer_minutes = pendingBuffer ?? shop?.buffer_minutes ?? 0
                              try {
                                const response = await fetch(`/api/shops/${shopId}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ base_slot_minutes, buffer_minutes })
                                })
                                if (response.ok) {
                                  setShop({ ...shop, base_slot_minutes, buffer_minutes })
                                  toast.success('Configuración guardada')
                                  setEditingGeneral(false)
                                } else {
                                  toast.error('Error al guardar cambios')
                                }
                              } catch {
                                toast.error('Error al guardar cambios')
                              }
                            }}
                          >Guardar cambios</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPendingBaseSlot(null)
                              setPendingBuffer(null)
                              setEditingGeneral(false)
                            }}
                          >Cancelar</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => {
                          setPendingBaseSlot(shop?.base_slot_minutes ?? 15)
                          setPendingBuffer(shop?.buffer_minutes ?? 0)
                          setEditingGeneral(true)
                        }}>Editar</Button>
                      )}
                    </div>
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Store className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
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

        <TabsPanels>
          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Configuración General</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Modo de Confirmación de Reservas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Elige cómo se gestionarán las nuevas reservas de clientes.
                    </p>

                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <input
                          type="radio"
                          name="confirmationMode"
                          value="manual"
                          checked={shop?.bookingConfirmationMode === 'manual'}
                          onChange={async (e) => {
                            try {
                              const response = await fetch(`/api/shops/${shopId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ bookingConfirmationMode: 'manual' })
                              })
                              if (response.ok) {
                                const updated = await response.json()
                                setShop({ ...shop, bookingConfirmationMode: 'manual' })
                                toast.success('Modo de confirmación actualizado a Manual')
                              }
                            } catch (error) {
                              toast.error('Error al actualizar configuración')
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">✋ Manual</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Pendiente</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Las reservas quedan con estado <strong>"pendiente"</strong>. Debes confirmarlas manualmente desde el dashboard. Los clientes reciben un email de "Reserva Recibida" y luego otro de "Confirmación" cuando la apruebes.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <input
                          type="radio"
                          name="confirmationMode"
                          value="automatic"
                          checked={shop?.bookingConfirmationMode === 'automatic'}
                          onChange={async (e) => {
                            try {
                              const response = await fetch(`/api/shops/${shopId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ bookingConfirmationMode: 'automatic' })
                              })
                              if (response.ok) {
                                const updated = await response.json()
                                setShop({ ...shop, bookingConfirmationMode: 'automatic' })
                                toast.success('Modo de confirmación actualizado a Automático')
                              }
                            } catch (error) {
                              toast.error('Error al actualizar configuración')
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">⚡ Automática</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Confirmado</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Las reservas se crean directamente con estado <strong>"confirmado"</strong>. Los clientes reciben un email de "Reserva Confirmada" inmediatamente. Ideal para agilizar el proceso.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-900">
                          <strong>Consejo:</strong> Usa el modo <strong>Manual</strong> si necesitas revisar disponibilidad o coordinar con tu equipo antes de confirmar. Usa <strong>Automático</strong> si confías en tu sistema de horarios y quieres confirmaciones instantáneas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                shopName={shop?.name || scheduleDict.page.shopFallback}
                locale={locale}
                scheduleDict={scheduleDict}
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
                  locale={locale}
                  scheduleDict={scheduleDict}
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
                showCreateButton={false}
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
      </Tabs>
    </div>
  )
}
