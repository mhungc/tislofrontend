'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, DollarSign } from 'lucide-react'

export function ServiceModifiersDemo() {
  const [modifiers] = useState([
    {
      id: '1',
      name: 'Niños con necesidades especiales',
      description: 'Tiempo adicional para atención especializada',
      duration_modifier: 20,
      price_modifier: 5,
      auto_apply: true
    }
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Modificadores de Servicio</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Modificador
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          🎯 Demo: Sistema implementado. Configurar RLS en Supabase para habilitar.
        </p>
      </div>

      {modifiers.map((modifier) => (
        <Card key={modifier.id}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{modifier.name}</h4>
                  <Badge variant="default">Automático</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{modifier.description}</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    +{modifier.duration_modifier} min
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    +${modifier.price_modifier}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}