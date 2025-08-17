'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Download } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu negocio con métricas detalladas.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics y Reportes</CardTitle>
          <CardDescription>
            Aquí podrás ver métricas detalladas de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Analytics y Reportes</h3>
            <p className="text-muted-foreground mb-4">
              Próximamente: Gráficos, métricas y reportes detallados de tu negocio
            </p>
            <Button>
              <TrendingUp className="mr-2 h-4 w-4" />
              Ver Métricas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

