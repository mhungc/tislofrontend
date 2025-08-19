'use client'

import React, { useState } from 'react'
import { ShopService } from '@/lib/services/shop-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Store, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreateShopFormProps {
  onSuccess?: () => void
  onCancel?: () => void
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
  const [saving, setSaving] = useState(false)

  const shopService = new ShopService()

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Nombre y dirección son requeridos')
      return
    }

    setSaving(true)
    try {
      const result = await shopService.createShop(formData)
      toast.success('Tienda creada correctamente')
      onSuccess?.()
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nombre de la tienda"
                required
              />
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
              required
            />
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
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contacto@tutienda.com"
              />
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
            />
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