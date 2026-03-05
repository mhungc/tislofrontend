'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'es'
  const isEnglish = locale === 'en'
  const t = {
    nameRequired: isEnglish ? 'Shop name is required' : 'El nombre de la tienda es obligatorio',
    nameMin: isEnglish ? 'Name must have at least 2 characters' : 'El nombre debe tener al menos 2 caracteres',
    addressRequired: isEnglish ? 'Address is required' : 'La dirección es obligatoria',
    emailRequired: isEnglish ? 'Email is required' : 'El email es obligatorio',
    emailInvalid: isEnglish ? 'Enter a valid email (example@domain.com)' : 'Ingresa un email válido (ejemplo@dominio.com)',
    phoneInvalid: isEnglish ? 'Enter a valid phone number (at least 10 digits)' : 'Ingresa un teléfono válido (mínimo 10 dígitos)',
    websiteProtocol: isEnglish ? 'URL must start with http:// or https://' : 'La URL debe comenzar con http:// o https://',
    websiteInvalid: isEnglish ? 'Enter a valid URL (https://example.com)' : 'Ingresa una URL válida (https://ejemplo.com)',
    formErrors: isEnglish ? 'Please fix form errors' : 'Por favor corrige los errores del formulario',
    created: isEnglish ? 'Shop created successfully' : 'Tienda creada correctamente',
    createError: isEnglish ? 'Error creating shop' : 'Error al crear la tienda',
    newShop: isEnglish ? 'New Shop' : 'Nueva Tienda',
    name: isEnglish ? 'Name *' : 'Nombre *',
    namePlaceholder: isEnglish ? 'Shop name' : 'Nombre de la tienda',
    bookingMode: isEnglish ? 'Booking Confirmation' : 'Confirmación de Reservas',
    manual: isEnglish ? 'Manual (pending status)' : 'Manual (queda pendiente)',
    automatic: isEnglish ? 'Automatic (confirmed on create)' : 'Automática (confirmada al crear)',
    timezone: isEnglish ? 'Timezone' : 'Zona Horaria',
    description: isEnglish ? 'Description' : 'Descripción',
    descriptionPlaceholder: isEnglish ? 'Describe your shop...' : 'Describe tu tienda...',
    address: isEnglish ? 'Address *' : 'Dirección *',
    addressPlaceholder: isEnglish ? 'Full address' : 'Dirección completa',
    phone: isEnglish ? 'Phone' : 'Teléfono',
    email: isEnglish ? 'Email *' : 'Email *',
    website: isEnglish ? 'Website' : 'Sitio Web',
    emailPlaceholder: isEnglish ? 'contact@yourshop.com' : 'contacto@tutienda.com',
    websitePlaceholder: isEnglish ? 'https://www.yourshop.com' : 'https://www.tutienda.com',
    creating: isEnglish ? 'Creating...' : 'Creando...',
    createShop: isEnglish ? 'Create Shop' : 'Crear Tienda',
    cancel: isEnglish ? 'Cancel' : 'Cancelar',
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    bookingConfirmationMode: 'manual' as 'manual' | 'automatic',
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
      newErrors.name = t.nameRequired
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t.nameMin
    }

    // Validar dirección (obligatorio)
    if (!formData.address.trim()) {
      newErrors.address = t.addressRequired
    }

    // Validar email (obligatorio)
    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t.emailInvalid
      }
    }

    // Validar teléfono (opcional pero debe ser válido si se proporciona)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = t.phoneInvalid
      }
    }

    // Validar website (opcional pero debe ser válida si se proporciona)
    if (formData.website.trim()) {
      try {
        const url = new URL(formData.website)
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.website = t.websiteProtocol
        }
      } catch {
        newErrors.website = t.websiteInvalid
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error(t.formErrors)
      return
    }

    setSaving(true)
    try {
      const result = await shopService.createShop(formData)
      toast.success(t.created)
      onSuccess?.(result.id, result)
    } catch (error) {
      console.error('Error al crear tienda:', error)
      toast.error(error instanceof Error ? error.message : t.createError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {t.newShop}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={t.namePlaceholder}
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
              <Label htmlFor="booking-confirmation-mode">{t.bookingMode}</Label>
              <select
                id="booking-confirmation-mode"
                value={formData.bookingConfirmationMode}
                onChange={(e) => updateField('bookingConfirmationMode', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="manual">{t.manual}</option>
                <option value="automatic">{t.automatic}</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="timezone">{t.timezone}</Label>
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
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">{t.address}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder={t.addressPlaceholder}
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
              <Label htmlFor="phone">{t.phone}</Label>
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
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder={t.emailPlaceholder}
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
            <Label htmlFor="website">{t.website}</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder={t.websitePlaceholder}
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
              {saving ? t.creating : t.createShop}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              {t.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
