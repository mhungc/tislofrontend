'use client'

import React, { useState, useEffect } from 'react'
import { ShopService } from '@/lib/services/shop-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X, Store, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface ShopFormProps {
  shopId?: string
  onSave?: () => void
  onCancel?: () => void
  className?: string
}

interface ShopFormData {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  timezone: string
  is_active: boolean
  business_hours: {
    monday: { open: string; close: string; is_open: boolean }
    tuesday: { open: string; close: string; is_open: boolean }
    wednesday: { open: string; close: string; is_open: boolean }
    thursday: { open: string; close: string; is_open: boolean }
    friday: { open: string; close: string; is_open: boolean }
    saturday: { open: string; close: string; is_open: boolean }
    sunday: { open: string; close: string; is_open: boolean }
  }
}

export function ShopForm({
  shopId,
  onSave,
  onCancel,
  className = ''
}: ShopFormProps) {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'America/New_York',
    is_active: true,
    business_hours: {
      monday: { open: '09:00', close: '18:00', is_open: true },
      tuesday: { open: '09:00', close: '18:00', is_open: true },
      wednesday: { open: '09:00', close: '18:00', is_open: true },
      thursday: { open: '09:00', close: '18:00', is_open: true },
      friday: { open: '09:00', close: '18:00', is_open: true },
      saturday: { open: '10:00', close: '16:00', is_open: true },
      sunday: { open: '10:00', close: '16:00', is_open: false }
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const shopService = new ShopService()

  // Cargar tienda si estamos editando
  useEffect(() => {
    if (shopId) {
      loadShop()
    }
  }, [shopId])

  const loadShop = async () => {
    if (!shopId) return

    setLoading(true)
    try {
      const shop = await shopService.getShop(shopId)
      if (shop) {
        setFormData({
          name: shop.name,
          description: shop.description || '',
          address: shop.address || '',
          phone: shop.phone || '',
          email: shop.email || '',
          website: shop.website || '',
          timezone: shop.timezone || 'America/New_York',
          is_active: shop.is_active,
          business_hours: shop.business_hours || {
            monday: { open: '09:00', close: '18:00', is_open: true },
            tuesday: { open: '09:00', close: '18:00', is_open: true },
            wednesday: { open: '09:00', close: '18:00', is_open: true },
            thursday: { open: '09:00', close: '18:00', is_open: true },
            friday: { open: '09:00', close: '18:00', is_open: true },
            saturday: { open: '10:00', close: '16:00', is_open: true },
            sunday: { open: '10:00', close: '16:00', is_open: false }
          }
        })
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error al cargar tienda:', error)
      toast.error('Error al cargar la tienda')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar campo del formulario
  const updateField = (field: keyof ShopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Actualizar horario de un día específico
  const updateBusinessHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day as keyof typeof prev.business_hours],
          [field]: value
        }
      }
    }))
  }

  // Validar formulario
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push('El nombre de la tienda es requerido')
    }

    if (!formData.address.trim()) {
      errors.push('La dirección es requerida')
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      errors.push('Debe proporcionar al menos un teléfono o email')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El formato del email no es válido')
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.push('El sitio web debe comenzar con http:// o https://')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Guardar tienda
  const saveShop = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    setSaving(true)
    try {
      if (isEditing && shopId) {
        await shopService.updateShop(shopId, formData)
        toast.success('Tienda actualizada correctamente')
      } else {
        await shopService.createShop(formData)
        toast.success('Tienda creada correctamente')
      }
      
      onSave?.()
    } catch (error) {
      console.error('Error al guardar tienda:', error)
      toast.error('Error al guardar la tienda')
    } finally {
      setSaving(false)
    }
  }

  // Aplicar horario a todos los días
  const applyToAllDays = (field: 'open' | 'close' | 'is_open', value: any) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days.forEach(day => {
      updateBusinessHours(day, field, value)
    })
  }

  // Obtener nombre del día
  const getDayName = (day: string) => {
    const dayNames: { [key: string]: string } = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }
    return dayNames[day] || day
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
          <Store className="h-5 w-5" />
          {isEditing ? 'Editar Tienda' : 'Nueva Tienda'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Store className="h-4 w-4" />
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shop-name">Nombre de la Tienda *</Label>
              <Input
                id="shop-name"
                placeholder="Ej: Peluquería María, Spa Relax"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="shop-timezone">Zona Horaria</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => updateField('timezone', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Este (EST/EDT)</SelectItem>
                  <SelectItem value="America/Chicago">Centro (CST/CDT)</SelectItem>
                  <SelectItem value="America/Denver">Montaña (MST/MDT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacífico (PST/PDT)</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska (AKST/AKDT)</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii (HST)</SelectItem>
                  <SelectItem value="Europe/Madrid">España (CET/CEST)</SelectItem>
                  <SelectItem value="America/Mexico_City">México (CST/CDT)</SelectItem>
                  <SelectItem value="America/Bogota">Colombia (COT)</SelectItem>
                  <SelectItem value="America/Argentina/Buenos_Aires">Argentina (ART)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="shop-description">Descripción</Label>
            <Textarea
              id="shop-description"
              placeholder="Describe tu tienda, servicios especiales, historia..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Información de Contacto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shop-address">Dirección *</Label>
              <div className="relative mt-1">
                <Input
                  id="shop-address"
                  placeholder="Dirección completa de la tienda"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="shop-phone">Teléfono</Label>
              <div className="relative mt-1">
                <Input
                  id="shop-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="shop-email">Email</Label>
              <div className="relative mt-1">
                <Input
                  id="shop-email"
                  type="email"
                  placeholder="contacto@tutienda.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="shop-website">Sitio Web</Label>
              <div className="relative mt-1">
                <Input
                  id="shop-website"
                  type="url"
                  placeholder="https://www.tutienda.com"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="pl-10"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Horarios de Negocio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horarios de Negocio
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyToAllDays('open', '09:00')}
              >
                Aplicar 9:00 AM
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyToAllDays('close', '18:00')}
              >
                Aplicar 6:00 PM
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(formData.business_hours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-24">
                  <Label className="text-sm font-medium">{getDayName(day)}</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={hours.is_open}
                    onCheckedChange={(checked) => updateBusinessHours(day, 'is_open', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {hours.is_open ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                
                {hours.is_open && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Estado de la Tienda */}
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => updateField('is_active', checked)}
          />
          <Label>Tienda activa</Label>
          <Badge variant={formData.is_active ? "default" : "secondary"}>
            {formData.is_active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>

        {/* Resumen */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-3">Resumen de la Tienda</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{formData.name || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dirección:</span>
                <span className="font-medium">{formData.address || 'Sin dirección'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacto:</span>
                <span className="font-medium">
                  {formData.phone || formData.email || 'Sin contacto'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días abiertos:</span>
                <span className="font-medium">
                  {Object.values(formData.business_hours).filter(h => h.is_open).length} días
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={formData.is_active ? "default" : "secondary"} className="text-xs">
                  {formData.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            onClick={saveShop}
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

