'use client'

import React, { useState, useEffect } from 'react'
import { ModifierService } from '@/lib/services/modifier-service'
import { ServiceModifier, ServiceModifierData, ConditionType } from '@/lib/types/modifiers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
// import { Switch } from '@/components/ui/switch' // No usado
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface ServiceModifiersProps {
  serviceId: string
}

export function ServiceModifiers({ serviceId }: ServiceModifiersProps) {
  const [modifiers, setModifiers] = useState<ServiceModifier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingModifier, setEditingModifier] = useState<ServiceModifier | null>(null)
  const [loading, setLoading] = useState(true)

  const modifierService = new ModifierService()

  useEffect(() => {
    loadModifiers()
  }, [serviceId])

  const loadModifiers = async () => {
    try {
      const data = await modifierService.getServiceModifiers(serviceId)
      setModifiers(data)
    } catch (error) {
      console.warn('Modificadores no disponibles aún')
      setModifiers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (modifierId: string) => {
    try {
      await modifierService.deleteModifier(modifierId)
      toast.success('Modificador eliminado')
      loadModifiers()
    } catch (error) {
      toast.error('Error al eliminar modificador')
    }
  }

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Modificadores de Servicio</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Modificador
        </Button>
      </div>

      {modifiers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hay modificadores configurados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {modifiers.map((modifier) => (
            <Card key={modifier.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{modifier.name}</h4>
                      <Badge variant={modifier.auto_apply ? 'default' : 'secondary'}>
                        {modifier.auto_apply ? 'Automático' : 'Manual'}
                      </Badge>
                    </div>
                    {modifier.description && (
                      <p className="text-sm text-muted-foreground">{modifier.description}</p>
                    )}
                    <div className="flex gap-4 text-sm">
                      {modifier.duration_modifier !== 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {modifier.duration_modifier > 0 ? '+' : ''}{modifier.duration_modifier} min
                        </div>
                      )}
                      {modifier.price_modifier !== 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {modifier.price_modifier > 0 ? '+' : ''}${modifier.price_modifier}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingModifier(modifier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(modifier.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(showForm || editingModifier) && (
        <ModifierForm
          serviceId={serviceId}
          modifier={editingModifier}
          onSuccess={() => {
            setShowForm(false)
            setEditingModifier(null)
            loadModifiers()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingModifier(null)
          }}
        />
      )}
    </div>
  )
}

interface ModifierFormProps {
  serviceId: string
  modifier?: ServiceModifier | null
  onSuccess: () => void
  onCancel: () => void
}

function ModifierForm({ serviceId, modifier, onSuccess, onCancel }: ModifierFormProps) {
  const [formData, setFormData] = useState<ServiceModifierData>({
    name: modifier?.name || '',
    description: modifier?.description || '',
    condition_type: modifier?.condition_type || 'manual',
    condition_value: modifier?.condition_value || {},
    duration_modifier: modifier?.duration_modifier || 0,
    price_modifier: modifier?.price_modifier || 0,
    is_active: modifier?.is_active ?? true,
    auto_apply: modifier?.auto_apply ?? false
  })
  // Estados separados para los inputs numéricos como strings
  const [durationInput, setDurationInput] = useState<string>(
    modifier?.duration_modifier?.toString() || ''
  )
  const [priceInput, setPriceInput] = useState<string>(
    modifier?.price_modifier?.toString() || ''
  )
  const [saving, setSaving] = useState(false)

  const modifierService = new ModifierService()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Convertir los valores de string a números
      const duration = parseInt(durationInput) || 0
      const price = parseFloat(priceInput) || 0

      // Validar que sean números válidos
      if (isNaN(duration)) {
        toast.error('El tiempo adicional debe ser un número válido')
        setSaving(false)
        return
      }

      if (isNaN(price)) {
        toast.error('El precio adicional debe ser un número válido')
        setSaving(false)
        return
      }

      const dataToSave = {
        ...formData,
        duration_modifier: duration,
        price_modifier: price
      }

      if (modifier) {
        await modifierService.updateModifier(modifier.id, dataToSave)
        toast.success('Modificador actualizado')
      } else {
        await modifierService.createModifier(serviceId, dataToSave)
        toast.success('Modificador creado')
      }
      onSuccess()
    } catch (error) {
      toast.error('Error al guardar modificador')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{modifier ? 'Editar' : 'Nuevo'} Modificador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Niños con necesidades especiales"
                isRequired
              />
            </div>
            <div>
              <Label>Tipo de Condición</Label>
              <Select
                value={formData.condition_type}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, condition_type: e.target.value as ConditionType }))
                }
                placeholder="Selecciona una condición"
              >
                <option value="manual">Manual</option>
                <option value="customer_tag">Etiqueta de Cliente</option>
                <option value="age_range">Rango de Edad</option>
                <option value="first_visit">Primera Visita</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tiempo Adicional (minutos)</Label>
              <Input
                type="number"
                value={durationInput}
                onChange={(e) => {
                  const value = e.target.value
                  // Permitir valores vacíos y números (incluyendo negativos)
                  if (value === '' || value === '-' || !isNaN(Number(value))) {
                    setDurationInput(value)
                  }
                }}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minutos a agregar (+) o reducir (-)
              </p>
            </div>
            <div>
              <Label>Precio Adicional</Label>
              <Input
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => {
                  const value = e.target.value
                  // Permitir valores vacíos, números con decimales (incluyendo negativos)
                  if (value === '' || value === '-' || !isNaN(Number(value))) {
                    setPriceInput(value)
                  }
                }}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Monto a agregar (+) o descontar (-)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.auto_apply}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_apply: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label>Aplicar automáticamente</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}