'use client'

import React, { useState, useEffect } from 'react'
import { ServiceService } from '@/lib/services/service-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Save, X, Clock, DollarSign, Package } from 'lucide-react'
import { toast } from 'sonner'

interface ServiceFormProps {
  shopId: string
  serviceId?: string
  onSave?: () => void
  onCancel?: () => void
  className?: string
}

interface ServiceFormData {
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

export function ServiceForm({
  shopId,
  serviceId,
  onSave,
  onCancel,
  className = ''
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const serviceService = new ServiceService()

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
      const service = await serviceService.getService(serviceId)
      if (service) {
        setFormData({
          name: service.name,
          description: service.description || '',
          duration_minutes: service.duration_minutes,
          price: service.price || 0,
          is_active: service.is_active
        })
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error)
      toast.error('Error al cargar el servicio')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar campo del formulario
  const updateField = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Validar formulario
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('El nombre del servicio es requerido')
    }

    if (formData.duration_minutes <= 0) {
      errors.push('La duración debe ser mayor a 0')
    }

    if (formData.duration_minutes > 480) { // 8 horas máximo
      errors.push('La duración no puede ser mayor a 8 horas')
    }

    if (formData.price < 0) {
      errors.push('El precio no puede ser negativo')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Guardar servicio
  const saveService = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    setSaving(true)
    try {
      if (isEditing && serviceId) {
        await serviceService.updateService(serviceId, formData)
        toast.success('Servicio actualizado correctamente')
      } else {
        await serviceService.createService(formData, shopId)
        toast.success('Servicio creado correctamente')
      }
      
      onSave?.()
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      toast.error('Error al guardar el servicio')
    } finally {
      setSaving(false)
    }
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nombre del servicio */}
        <div>
          <Label htmlFor="service-name">Nombre del Servicio *</Label>
          <Input
            id="service-name"
            placeholder="Ej: Corte de cabello, Masaje, Consulta médica"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Descripción */}
        <div>
          <Label htmlFor="service-description">Descripción</Label>
          <Textarea
            id="service-description"
            placeholder="Describe el servicio, incluye detalles importantes..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Duración y Precio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="service-duration">Duración (minutos) *</Label>
            <div className="relative mt-1">
              <Input
                id="service-duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => updateField('duration_minutes', parseInt(e.target.value) || 0)}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDuration(formData.duration_minutes)}
            </div>
          </div>

          <div>
            <Label htmlFor="service-price">Precio *</Label>
            <div className="relative mt-1">
              <Input
                id="service-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className="pl-8"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Estado activo */}
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.is_active}
            onClick={() => updateField('is_active', !formData.is_active)}
          />
          <Label>Servicio activo</Label>
          <Badge variant={formData.is_active ? "default" : "secondary"}>
            {formData.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Resumen del servicio */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">Resumen del Servicio</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{formData.name || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span className="font-medium">{formatDuration(formData.duration_minutes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio:</span>
                <span className="font-medium">${formData.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={formData.is_active ? "default" : "secondary"} className="text-xs">
                  {formData.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            onClick={saveService}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

