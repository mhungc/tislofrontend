'use client'

import React, { useState, useEffect } from 'react'
import { BookingService } from '@/lib/services/booking-service'
import { ServiceService } from '@/lib/services/service-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Save, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ManualBookingFormProps {
  shopId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_date: string
  start_time: string
  service_id: string
  notes: string
}

export function ManualBookingForm({ shopId, onSuccess, onCancel }: ManualBookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    booking_date: '',
    start_time: '',
    service_id: '',
    notes: ''
  })
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const bookingService = new BookingService()
  const serviceService = new ServiceService()

  useEffect(() => {
    loadServices()
  }, [shopId])

  const loadServices = async () => {
    try {
      const shopServices = await serviceService.getShopServices(shopId)
      setServices(shopServices.filter(s => s.is_active))
    } catch (error) {
      toast.error('Error al cargar servicios')
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getSelectedService = () => {
    return services.find(s => s.id === formData.service_id)
  }

  const calculateEndTime = () => {
    const service = getSelectedService()
    if (!formData.start_time || !service) return ''

    const [hours, minutes] = formData.start_time.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000)
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  }

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      toast.error('El nombre del cliente es requerido')
      return false
    }
    if (!formData.booking_date) {
      toast.error('La fecha es requerida')
      return false
    }
    if (!formData.start_time) {
      toast.error('La hora es requerida')
      return false
    }
    if (!formData.service_id) {
      toast.error('Debe seleccionar un servicio')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      const service = getSelectedService()
      const endTime = calculateEndTime()

      await bookingService.createManualBooking(shopId, {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        booking_date: formData.booking_date,
        start_time: formData.start_time,
        end_time: endTime,
        service_id: formData.service_id,
        notes: formData.notes,
        total_duration: service?.duration_minutes || 0,
        total_price: service?.price || 0
      })

      toast.success('Reserva creada exitosamente')
      resetForm()
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear la reserva')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      booking_date: '',
      start_time: '',
      service_id: '',
      notes: ''
    })
  }

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nueva Reserva Manual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Cliente
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer_name">Nombre Completo *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Nombre del cliente"
                  isRequired
                />
              </div>
              
              <div>
                <Label htmlFor="customer_phone">Teléfono</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  placeholder="Teléfono del cliente"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          {/* Reserva */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detalles de la Reserva
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="booking_date">Fecha *</Label>
                <Input
                  id="booking_date"
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => handleInputChange('booking_date', e.target.value)}
                  min={getMinDate()}
                  isRequired
                />
              </div>
              
              <div>
                <Label htmlFor="start_time">Hora de Inicio *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  isRequired
                />
              </div>

              <div>
                <Label>Hora de Fin</Label>
                <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{calculateEndTime() || '--:--'}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="service_id">Servicio *</Label>
              <Select value={formData.service_id} onChange={(e) => handleInputChange('service_id', e.target.value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <div className="flex gap-2 ml-4">
                          <Badge variant="outline">{service.duration_minutes}min</Badge>
                          <Badge variant="outline">${service.price || 0}</Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>

          {/* Resumen */}
          {formData.service_id && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumen</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Servicio:</span>
                  <span>{getSelectedService()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración:</span>
                  <span>{getSelectedService()?.duration_minutes} minutos</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${getSelectedService()?.price || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Crear Reserva'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}