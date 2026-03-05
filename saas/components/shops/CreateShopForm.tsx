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
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface CreateShopFormProps {
  locale: Locale
  shopsDict: Dictionary['shops']
  commonDict: Dictionary['common']
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

export function CreateShopForm({ locale, shopsDict, commonDict, onSuccess, onCancel }: CreateShopFormProps) {
  const isEnglish = locale === 'en'
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
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = isEnglish ? 'Shop name is required' : 'El nombre de la tienda es obligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = isEnglish ? 'Name must have at least 2 characters' : 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.address.trim()) {
      newErrors.address = isEnglish ? 'Address is required' : 'La dirección es obligatoria'
    }

    if (!formData.email.trim()) {
      newErrors.email = isEnglish ? 'Email is required' : 'El email es obligatorio'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = isEnglish ? 'Enter a valid email' : 'Ingresa un email válido'
      }
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = isEnglish ? 'Enter a valid phone number' : 'Ingresa un teléfono válido'
      }
    }

    if (formData.website.trim()) {
      try {
        const url = new URL(formData.website)
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.website = isEnglish ? 'URL must start with http:// or https://' : 'La URL debe comenzar con http:// o https://'
        }
      } catch {
        newErrors.website = isEnglish ? 'Enter a valid URL' : 'Ingresa una URL válida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(isEnglish ? 'Please fix form errors' : 'Por favor corrige los errores del formulario')
      return
    }

    setSaving(true)
    try {
      const result = await shopService.createShop(formData)
      toast.success(shopsDict.form.createSuccess)
      onSuccess?.(result.id, result)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isEnglish ? 'Error creating shop' : 'Error al crear la tienda'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {shopsDict.newShop}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{shopsDict.form.name} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={shopsDict.form.namePlaceholder}
                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="booking-confirmation-mode">{shopsDict.form.confirmationMode}</Label>
              <select
                id="booking-confirmation-mode"
                value={formData.bookingConfirmationMode}
                onChange={(e) => updateField('bookingConfirmationMode', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="manual">{shopsDict.form.manual}</option>
                <option value="automatic">{shopsDict.form.automatic}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="timezone">{shopsDict.form.timezone}</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
            <Label htmlFor="description">{shopsDict.form.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={shopsDict.form.descriptionPlaceholder}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">{shopsDict.form.address} *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder={shopsDict.form.addressPlaceholder}
              className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.address && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{shopsDict.form.phone}</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={shopsDict.form.phonePlaceholder} className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''} />
              {errors.phone && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">{shopsDict.form.email} *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder={shopsDict.form.emailPlaceholder} className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''} />
              {errors.email && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="website">{shopsDict.form.website}</Label>
            <Input id="website" type="url" value={formData.website} onChange={(e) => updateField('website', e.target.value)} placeholder={shopsDict.form.websitePlaceholder} className={errors.website ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            {errors.website && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.website}</p>}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={saving} className="flex items-center gap-2"><Save className="h-4 w-4" />{saving ? `${commonDict.loading}...` : commonDict.create}</Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}><X className="h-4 w-4 mr-2" />{commonDict.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
