'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import { ServicesList } from '@/components/services/ServicesList'

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona todos los servicios que ofreces en tus tiendas.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Contenido principal */}
      <ServicesList 
        shopId="all" // Para mostrar servicios de todas las tiendas
        onServiceSelect={(serviceId) => console.log('Seleccionar servicio:', serviceId)}
        onServiceEdit={(serviceId) => console.log('Editar servicio:', serviceId)}
      />
    </div>
  )
}

