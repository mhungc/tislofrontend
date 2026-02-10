'use client'

import React, { useState } from 'react'
import { ShopService } from '@/lib/services/shop-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Save, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CreateShopFormProps {
  onSuccess?: (shopId?: string, shopData?: any) => void
  onCancel?: () => void
}

interface FormErrors {
  name?: string
  address?: string
  email?: string
  phone?: string
  website?: string
}

export function CreateShopForm({ onSuccess, onCancel }: CreateShopFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'America/New_York'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const shopService = new ShopService()

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar nombre (obligatorio)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la tienda es obligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar dirección (obligatorio)
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria'
    }

    // Validar email (obligatorio)
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Ingresa un email válido (ejemplo@dominio.com)'
      }
    }

    // Validar teléfono (opcional pero debe ser válido si se proporciona)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Ingresa un teléfono válido (mínimo 10 dígitos)'
      }
    }

    // Validar website (opcional pero debe ser válida si se proporciona)
    if (formData.website.trim()) {
      try {
        const url = new URL(formData.website)
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.website = 'La URL debe comenzar con http:// o https://'
        }
      } catch {
        newErrors.website = 'Ingresa una URL válida (https://ejemplo.com)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario')
      return
    }

    setSaving(true)
    try {
      const result = await shopService.createShop(formData)
      toast.success('Tienda creada correctamente')
      onSuccess?.(result.id, result)
    } catch (error) {
      console.error('Error al crear tienda:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la tienda')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Nueva Tienda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nombre de la tienda"
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="America/New_York">Este (EST/EDT)</option>
                <option value="America/Chicago">Centro (CST/CDT)</option>
                <option value="America/Denver">Montaña (MST/MDT)</option>
                <option value="America/Los_Angeles">Pacífico (PST/PDT)</option>
                <option value="America/Mexico_City">México (CST/CDT)</option>
                <option value="Europe/Madrid">España (CET/CEST)</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe tu tienda..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Dirección completa"
              className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contacto@tutienda.com"
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://www.tutienda.com"
              className={errors.website ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.website && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.website}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Creando...' : 'Crear Tienda'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
