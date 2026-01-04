'use client'

import React, { useState, useEffect } from 'react'
import { ModifierService } from '@/lib/services/modifier-service'
import { ServiceModifier } from '@/lib/types/modifiers'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign } from 'lucide-react'

interface ModifierSelectorProps {
  serviceId: string
  customerData?: any
  selectedModifiers: string[]
  onModifiersChange: (modifierIds: string[], totalDuration: number, totalPrice: number) => void
}

export function ModifierSelector({ 
  serviceId, 
  customerData, 
  selectedModifiers, 
  onModifiersChange 
}: ModifierSelectorProps) {
  const [modifiers, setModifiers] = useState<ServiceModifier[]>([])
  const [autoApplied, setAutoApplied] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const modifierService = new ModifierService()

  useEffect(() => {
    loadModifiers()
  }, [serviceId, customerData])

  const loadModifiers = async () => {
    try {
      const allModifiers = await modifierService.getServiceModifiers(serviceId)
      const applicable = customerData 
        ? await modifierService.getApplicableModifiers(serviceId, customerData)
        : []

      setModifiers(allModifiers)
      
      const autoIds = applicable
        .filter(m => m.auto_apply)
        .map(m => m.id)
      
      setAutoApplied(autoIds)
      
      // Auto-aplicar modificadores
      if (autoIds.length > 0) {
        handleModifierChange(autoIds)
      }
    } catch (error) {
      console.error('Error loading modifiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModifierChange = (newSelectedIds: string[]) => {
    const selectedMods = modifiers.filter(m => newSelectedIds.includes(m.id))
    const totalDuration = selectedMods.reduce((sum, m) => sum + m.duration_modifier, 0)
    const totalPrice = selectedMods.reduce((sum, m) => sum + Number(m.price_modifier), 0)
    
    onModifiersChange(newSelectedIds, totalDuration, totalPrice)
  }

  const toggleModifier = (modifierId: string) => {
    const newSelected = selectedModifiers.includes(modifierId)
      ? selectedModifiers.filter(id => id !== modifierId)
      : [...selectedModifiers, modifierId]
    
    handleModifierChange(newSelected)
  }

  if (loading) return null

  if (modifiers.length === 0) return null

  return (
    <Card>
      <CardContent className="pt-4">
        <h4 className="font-medium mb-3">Modificadores Disponibles</h4>
        <div className="space-y-3">
          {modifiers.map((modifier) => (
            <div key={modifier.id} className="flex items-start space-x-3">
              <Checkbox
                isChecked={selectedModifiers.includes(modifier.id)}
                onChange={() => toggleModifier(modifier.id)}
                isDisabled={autoApplied.includes(modifier.id)}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{modifier.name}</span>
                  {autoApplied.includes(modifier.id) && (
                    <Badge variant="secondary" className="text-xs">Auto</Badge>
                  )}
                </div>
                {modifier.description && (
                  <p className="text-xs text-muted-foreground">{modifier.description}</p>
                )}
                <div className="flex gap-3 text-xs text-muted-foreground">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}