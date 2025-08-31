'use client'

import React, { useState, useEffect } from 'react'
import { ServiceService, ServiceData } from '@/lib/services/service-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { ServiceModifiers } from './ServiceModifiers'

interface ServiceFormProps {
  shopId: string
  serviceId?: string
  onSuccess?: (serviceId?: string) => void
  onCancel?: () => void
  className?: string
}

export function ServiceForm({
  shopId,
  serviceId,
  onSuccess,
  onCancel,
  className = ''
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceData>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: null,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const serviceService = new ServiceService()
  const isEditing = !!serviceId

  // Cargar servicio si estamos editando
  useEffect(() => {
    if (serviceId) {
      loadService()
    }
  }, [serviceId])

  const loadService = async () => {
    if (!serviceId) return
    
    setLoading(true)
    try {
      const service = await serviceService.getService(shopId, serviceId)
      if (service) {
        setFormData({
          name: service.name,
          description: service.description || '',
          duration_minutes: service.duration_minutes,
          price: service.price,
          is_active: service.is_active
        })
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error)
      toast.error('Error al cargar el servicio')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.name.trim()) {
      toast.error('El nombre del servicio es requerido')
      return
    }
    
    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      toast.error('La duración debe ser mayor a 0 minutos')
      return
    }

    setSaving(true)
    try {
      if (isEditing && serviceId) {
        await serviceService.updateService(shopId, serviceId, formData)
        toast.success('Servicio actualizado correctamente')
      } else {
        const newService = await serviceService.createService(shopId, formData)
        toast.success('Servicio creado correctamente')
        onSuccess?.(newService.id)
        return
      }
      
      onSuccess?.(serviceId)
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      toast.error(isEditing ? 'Error al actualizar servicio' : 'Error al crear servicio')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ServiceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Sugerencias de duración
  const durationSuggestions = [15, 30, 45, 60, 90, 120, 180]

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <CardTitle>
              {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Servicio *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Corte de cabello"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deja vacío si el servicio es gratuito
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu servicio..."
                rows={3}
              />
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos) *</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                  className="w-32"
                  required
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
              
              {/* Sugerencias de duración */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Sugerencias:</span>
                {durationSuggestions.map(duration => (
                  <Button
                    key={duration}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('duration_minutes', duration)}
                    className="text-xs h-6"
                  >
                    {duration}min
                  </Button>
                ))}
              </div>
            </div>

            {/* Estado activo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Servicio activo</Label>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-32"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Actualizar' : 'Crear'} Servicio
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modificadores */}
      {isEditing && serviceId && (
        <Card>
          <CardContent className="pt-6">
            <ServiceModifiers serviceId={serviceId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}