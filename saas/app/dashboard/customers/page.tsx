'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu base de datos de clientes y sus preferencias.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
          <CardDescription>
            Aquí podrás ver y gestionar todos tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Gestión de Clientes</h3>
            <p className="text-muted-foreground mb-4">
              Próximamente: Lista completa de clientes con historial y preferencias
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Cliente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

