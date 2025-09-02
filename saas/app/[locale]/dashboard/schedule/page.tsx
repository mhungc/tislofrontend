'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Horarios</h1>
          <p className="text-muted-foreground">
            Configura los horarios de trabajo y excepciones para tus tiendas.
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Configurar Horarios
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Horarios</CardTitle>
          <CardDescription>
            Aquí podrás configurar los horarios de trabajo y excepciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Gestión de Horarios</h3>
            <p className="text-muted-foreground mb-4">
              Próximamente: Configuración de horarios semanales y excepciones
            </p>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Configurar Horarios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

