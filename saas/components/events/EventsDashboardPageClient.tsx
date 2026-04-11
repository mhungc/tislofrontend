'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useShopStore } from '@/lib/stores/shop-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Copy, ExternalLink, Link2, Pencil, Plus, Store, Trash2, Users } from 'lucide-react'

interface EventItem {
  id: string
  store_id: string
  name: string
  description?: string | null
  date: string
  start_time: string
  end_time: string
  capacity: number
  price?: number | null
  availability: {
    capacity: number
    reserved: number
    available: number
  }
}

interface EventFormState {
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  capacity: string
  price: string
}

interface ShopSchedule {
  id: string
  day_of_week: number
  open_time: string | Date
  close_time: string | Date
  is_working_day?: boolean | null
  block_order?: number | null
}

const emptyForm: EventFormState = {
  name: '',
  description: '',
  date: '',
  start_time: '',
  end_time: '',
  capacity: '10',
  price: ''
}

export function EventsDashboardPageClient() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'es'
  const isEnglish = locale === 'en'
  const { shops, loading: shopsLoading, loadShops } = useShopStore()

  const [selectedShopId, setSelectedShopId] = useState('')
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [form, setForm] = useState<EventFormState>(emptyForm)
  const [shopSchedules, setShopSchedules] = useState<ShopSchedule[]>([])

  useEffect(() => {
    loadShops()
  }, [loadShops])

  useEffect(() => {
    if (!selectedShopId && shops.length > 0) {
      setSelectedShopId(shops[0].id)
    }
  }, [shops, selectedShopId])

  useEffect(() => {
    if (selectedShopId) {
      void loadEvents(selectedShopId)
      void loadSchedules(selectedShopId)
    }
  }, [selectedShopId])

  const selectedShop = useMemo(
    () => shops.find((shop) => shop.id === selectedShopId),
    [shops, selectedShopId]
  )

  const publicEventsUrl = useMemo(() => {
    if (!selectedShopId || typeof window === 'undefined') {
      return ''
    }

    return `${window.location.origin}/${locale}/book/events/${selectedShopId}`
  }, [locale, selectedShopId])

  const content = {
    title: isEnglish ? 'Events' : 'Eventos',
    subtitle: isEnglish ? 'Manage capacity-based events by store' : 'Gestiona eventos por capacidad en cada tienda',
    emptyStoresTitle: isEnglish ? 'No stores available' : 'No tienes tiendas',
    emptyStoresDescription: isEnglish ? 'Create a store before adding events.' : 'Crea una tienda antes de publicar eventos.',
    createStore: isEnglish ? 'Create Store' : 'Crear Tienda',
    selectStore: isEnglish ? 'Select a store' : 'Selecciona una tienda',
    addEvent: isEnglish ? 'New Event' : 'Nuevo Evento',
    editEvent: isEnglish ? 'Edit Event' : 'Editar Evento',
    createEvent: isEnglish ? 'Create Event' : 'Crear Evento',
    save: isEnglish ? 'Save Changes' : 'Guardar Cambios',
    cancel: isEnglish ? 'Cancel' : 'Cancelar',
    noEvents: isEnglish ? 'No events yet for this store.' : 'Todavía no hay eventos para esta tienda.',
    full: isEnglish ? 'Full' : 'Completo',
    available: isEnglish ? 'available' : 'disponibles'
  }

  const formatScheduleTime = (value: string | Date) => {
    if (value instanceof Date) {
      return `${value.getUTCHours().toString().padStart(2, '0')}:${value.getUTCMinutes().toString().padStart(2, '0')}`
    }

    const text = String(value)
    if (text.includes('T')) {
      return text.split('T')[1]?.slice(0, 5) || text.slice(0, 5)
    }

    return text.slice(0, 5)
  }

  const parseDateWeekday = (date: string) => {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay()
  }

  const dayBlocks = useMemo(() => {
    if (!form.date) {
      return [] as Array<{ open: string; close: string }>
    }

    const weekday = parseDateWeekday(form.date)
    return shopSchedules
      .filter((schedule) => schedule.day_of_week === weekday && schedule.is_working_day !== false)
      .sort((a, b) => (a.block_order || 0) - (b.block_order || 0))
      .map((schedule) => ({
        open: formatScheduleTime(schedule.open_time),
        close: formatScheduleTime(schedule.close_time)
      }))
  }, [form.date, shopSchedules])

  const dayMinTime = dayBlocks.length > 0 ? dayBlocks[0].open : undefined
  const dayMaxTime = dayBlocks.length > 0 ? dayBlocks[dayBlocks.length - 1].close : undefined
  const dayHasWorkingHours = dayBlocks.length > 0
  const dayBlocksLabel = dayBlocks.map((block) => `${block.open}-${block.close}`).join(' · ')

  const isTimeRangeInsideBlocks = (startTime: string, endTime: string) => {
    if (!startTime || !endTime || !dayHasWorkingHours) {
      return false
    }

    return dayBlocks.some((block) => startTime >= block.open && endTime <= block.close)
  }

  const copyPublicUrl = async () => {
    if (!publicEventsUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(publicEventsUrl)
      toast.success(isEnglish ? 'Public link copied' : 'Enlace público copiado')
    } catch (error) {
      console.error(error)
      toast.error(isEnglish ? 'Unable to copy the link' : 'No se pudo copiar el enlace')
    }
  }

  const loadEvents = async (shopId: string) => {
    setEventsLoading(true)
    try {
      const response = await fetch(`/api/stores/${shopId}/events`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar eventos')
      }

      setEvents(Array.isArray(data.events) ? data.events : [])
    } catch (error) {
      console.error(error)
      toast.error(isEnglish ? 'Unable to load events' : 'No se pudieron cargar los eventos')
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  const loadSchedules = async (shopId: string) => {
    setSchedulesLoading(true)
    try {
      const response = await fetch(`/api/shops/${shopId}/schedule`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar horarios')
      }

      setShopSchedules(Array.isArray(data.schedules) ? data.schedules : [])
    } catch (error) {
      console.error(error)
      setShopSchedules([])
      toast.error(isEnglish ? 'Unable to load schedule' : 'No se pudo cargar el horario de la tienda')
    } finally {
      setSchedulesLoading(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingEventId(null)
    setMode('list')
  }

  const startCreate = () => {
    setForm(emptyForm)
    setEditingEventId(null)
    setMode('create')
  }

  const startEdit = (event: EventItem) => {
    setEditingEventId(event.id)
    setForm({
      name: event.name,
      description: event.description || '',
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      capacity: String(event.capacity),
      price: event.price === null || event.price === undefined ? '' : String(event.price)
    })
    setMode('edit')
  }

  const handleSave = async () => {
    if (!selectedShopId) {
      toast.error(isEnglish ? 'Select a store first' : 'Selecciona una tienda primero')
      return
    }

    if (!form.name || !form.date || !form.start_time || !form.end_time || !form.capacity) {
      toast.error(isEnglish ? 'Complete the required fields' : 'Completa los campos requeridos')
      return
    }

    if (!dayHasWorkingHours) {
      toast.error(isEnglish ? 'No working hours configured for the selected day' : 'La tienda no tiene horario de trabajo para ese día')
      return
    }

    if (!isTimeRangeInsideBlocks(form.start_time, form.end_time)) {
      toast.error(isEnglish ? 'The event must fit inside one configured schedule block for that day' : 'El evento debe estar dentro de un bloque horario configurado para ese día')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        price: form.price === '' ? null : Number(form.price)
      }

      const response = await fetch(
        mode === 'edit' && editingEventId ? `/api/events/${editingEventId}` : `/api/stores/${selectedShopId}/events`,
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando evento')
      }

      toast.success(mode === 'edit' ? (isEnglish ? 'Event updated' : 'Evento actualizado') : (isEnglish ? 'Event created' : 'Evento creado'))
      await loadEvents(selectedShopId)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : (isEnglish ? 'Unable to save event' : 'No se pudo guardar el evento'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm(isEnglish ? 'Delete this event?' : '¿Eliminar este evento?')
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando evento')
      }

      toast.success(isEnglish ? 'Event deleted' : 'Evento eliminado')
      await loadEvents(selectedShopId)
      if (editingEventId === eventId) {
        resetForm()
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : (isEnglish ? 'Unable to delete event' : 'No se pudo eliminar el evento'))
    }
  }

  if (shopsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Store className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h2 className="mb-2 text-lg font-semibold">{content.emptyStoresTitle}</h2>
          <p className="mb-4 text-muted-foreground">{content.emptyStoresDescription}</p>
          <Button onClick={() => router.push(`/${locale}/dashboard/shops`)}>{content.createStore}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </div>
        {mode === 'list' && (
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {content.addEvent}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="shop">{content.selectStore}</Label>
            <select
              id="shop"
              value={selectedShopId}
              onChange={(event) => setSelectedShopId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          {selectedShop && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <div className="font-medium">{selectedShop.name}</div>
              <div className="text-muted-foreground">{selectedShop.address || selectedShop.email}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedShopId && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50">
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
                  <Link2 className="h-4 w-4" />
                  {isEnglish ? 'Public events page' : 'Página pública de eventos'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isEnglish
                    ? 'Share one clean link for this store. Customers will see all active event blocks and can reserve spots directly.'
                    : 'Comparte un único enlace limpio para esta tienda. Tus clientes verán todos los eventos y podrán reservar plazas directamente.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyPublicUrl} className="min-w-36">
                  <Copy className="mr-2 h-4 w-4" />
                  {isEnglish ? 'Copy link' : 'Copiar enlace'}
                </Button>
                <Button variant="outline" onClick={() => window.open(publicEventsUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isEnglish ? 'Open page' : 'Abrir página'}
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-white/90 p-3 font-mono text-sm break-all text-slate-700 shadow-sm">
              {publicEventsUrl}
            </div>
          </CardContent>
        </Card>
      )}

      {(mode === 'create' || mode === 'edit') && (
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'edit' ? content.editEvent : content.createEvent}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedulesLoading ? (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                {isEnglish ? 'Loading store schedule...' : 'Cargando horario de la tienda...'}
              </div>
            ) : form.date ? (
              dayHasWorkingHours ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  {isEnglish ? 'Allowed time blocks for this day:' : 'Bloques permitidos para este día:'} {dayBlocksLabel}
                </div>
              ) : (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  {isEnglish
                    ? 'This store has no configured working hours for the selected day. Pick another date or update the store schedule.'
                    : 'Esta tienda no tiene horario de trabajo configurado para el día seleccionado. Elige otra fecha o ajusta el horario de la tienda.'}
                </div>
              )
            ) : (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                {isEnglish ? 'Select a date first to see available event hours.' : 'Selecciona primero una fecha para ver las horas disponibles del evento.'}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Hora inicio</Label>
                <Input
                  id="start_time"
                  type="time"
                  min={dayMinTime}
                  max={dayMaxTime}
                  isDisabled={!form.date || !dayHasWorkingHours}
                  value={form.start_time}
                  onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Hora fin</Label>
                <Input
                  id="end_time"
                  type="time"
                  min={dayMinTime}
                  max={dayMaxTime}
                  isDisabled={!form.date || !dayHasWorkingHours}
                  value={form.end_time}
                  onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad</Label>
                <Input id="capacity" type="number" min="1" value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving || !form.date || !dayHasWorkingHours}>
                {mode === 'edit' ? content.save : content.createEvent}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                {content.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {eventsLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Cargando eventos...</CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">{content.noEvents}</CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{event.name}</h2>
                      <Badge variant={event.availability.available > 0 ? 'outline' : 'secondary'}>
                        {event.availability.available > 0
                          ? `${event.availability.available} ${content.available}`
                          : content.full}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{event.date}</span>
                      <span>{event.start_time} - {event.end_time}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{event.availability.reserved}/{event.capacity}</span>
                      <span>{event.price ? `EUR ${event.price.toFixed(2)}` : (isEnglish ? 'Free' : 'Gratis')}</span>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(event)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {isEnglish ? 'Edit' : 'Editar'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isEnglish ? 'Delete' : 'Eliminar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}