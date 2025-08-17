'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus } from 'lucide-react'

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las citas y reservas de tus clientes.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Reservas</CardTitle>
          <CardDescription>
            Aquí podrás ver y gestionar todas las reservas de tus tiendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Gestión de Reservas</h3>
            <p className="text-muted-foreground mb-4">
              Próximamente: Lista completa de reservas con filtros y búsqueda
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

