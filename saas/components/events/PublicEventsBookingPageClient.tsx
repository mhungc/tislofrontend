'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, CheckCircle, Mail, MapPin, Ticket, Users } from 'lucide-react'
import type { Locale } from '@/lib/types/dictionary'

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

interface PublicEventsBookingPageClientProps {
  storeId: string
  locale: Locale
}

export function PublicEventsBookingPageClient({ storeId, locale }: PublicEventsBookingPageClientProps) {
  const isEnglish = locale === 'en'
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [events, setEvents] = useState<EventItem[]>([])
  const [store, setStore] = useState<any>(null)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    spots_reserved: '1',
    notes: ''
  })
  const [bookingComplete, setBookingComplete] = useState(false)

  const copy = {
    title: isEnglish ? 'Book an event' : 'Reserva un evento',
    subtitle: isEnglish ? 'Choose an event and reserve spots instantly.' : 'Elige un evento y reserva plazas al instante.',
    available: isEnglish ? 'spots available' : 'plazas disponibles',
    full: isEnglish ? 'Full' : 'Completo',
    reserve: isEnglish ? 'Reserve spots' : 'Reservar plazas',
    name: isEnglish ? 'Name' : 'Nombre',
    email: 'Email',
    spots: isEnglish ? 'Spots' : 'Plazas',
    event: isEnglish ? 'Selected event' : 'Evento seleccionado',
    successTitle: isEnglish ? 'Booking confirmed' : 'Reserva confirmada',
    successDescription: isEnglish ? 'Your event booking was registered successfully.' : 'Tu reserva del evento se registró correctamente.',
    empty: isEnglish ? 'No events available right now.' : 'No hay eventos disponibles en este momento.'
  }

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId]
  )

  useEffect(() => {
    void loadEvents()
  }, [storeId])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stores/${storeId}/events`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error loading events')
      }

      const nextEvents = Array.isArray(data.events) ? data.events : []
      setEvents(nextEvents)
      setStore(data.store)
      if (nextEvents.length > 0) {
        setSelectedEventId((current) => current || nextEvents[0].id)
      }
    } catch (error) {
      console.error(error)
      toast.error(isEnglish ? 'Unable to load events' : 'No se pudieron cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedEventId || !form.customer_name || !form.customer_email) {
      toast.error(isEnglish ? 'Complete the required fields' : 'Completa los campos requeridos')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/events/${selectedEventId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          spots_reserved: Number(form.spots_reserved),
          notes: form.notes
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error booking event')
      }

      setBookingComplete(true)
      toast.success(copy.successDescription)
      await loadEvents()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : (isEnglish ? 'Unable to book event' : 'No se pudo reservar el evento'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (bookingComplete && selectedEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold">{copy.successTitle}</h2>
            <p className="mb-4 text-muted-foreground">{copy.successDescription}</p>
            <div className="rounded-lg bg-muted/40 p-4 text-left text-sm">
              <div className="font-medium">{selectedEvent.name}</div>
              <div>{selectedEvent.date}</div>
              <div>{selectedEvent.start_time} - {selectedEvent.end_time}</div>
              <div>{form.spots_reserved} {copy.spots}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-700 px-6 py-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold">{copy.title}</h1>
          <p className="mt-2 text-sm text-teal-50">{copy.subtitle}</p>
          {store && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-teal-50">
              <span className="inline-flex items-center gap-2"><Ticket className="h-4 w-4" />{store.name}</span>
              {store.address && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{store.address}</span>}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">{copy.empty}</CardContent>
              </Card>
            ) : (
              events.map((event) => {
                const isSelected = event.id === selectedEventId
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={`w-full rounded-2xl border text-left transition ${isSelected ? 'border-teal-700 bg-white shadow-md' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                  >
                    <div className="space-y-3 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-stone-900">{event.name}</h2>
                            <Badge variant={event.availability.available > 0 ? 'outline' : 'secondary'}>
                              {event.availability.available > 0 ? `${event.availability.available} ${copy.available}` : copy.full}
                            </Badge>
                          </div>
                          {event.description && <p className="mt-2 text-sm text-stone-600">{event.description}</p>}
                        </div>
                        <div className="text-sm font-medium text-stone-700">
                          {event.price ? `EUR ${event.price.toFixed(2)}` : (isEnglish ? 'Free' : 'Gratis')}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{event.date}</span>
                        <span>{event.start_time} - {event.end_time}</span>
                        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{event.availability.reserved}/{event.capacity}</span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{copy.reserve}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvent && (
                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                  <div className="font-medium">{copy.event}: {selectedEvent.name}</div>
                  <div className="mt-2 text-muted-foreground">{selectedEvent.date} · {selectedEvent.start_time} - {selectedEvent.end_time}</div>
                  <div className="mt-2 text-muted-foreground">{selectedEvent.availability.available} {copy.available}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="customer_name">{copy.name}</Label>
                <Input id="customer_name" value={form.customer_name} onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">{copy.email}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="customer_email" type="email" value={form.customer_email} onChange={(event) => setForm((current) => ({ ...current, customer_email: event.target.value }))} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spots_reserved">{copy.spots}</Label>
                <Input id="spots_reserved" type="number" min="1" max={selectedEvent?.availability.available || 1} value={form.spots_reserved} onChange={(event) => setForm((current) => ({ ...current, spots_reserved: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting || !selectedEvent || selectedEvent.availability.available <= 0}>
                {copy.reserve}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}