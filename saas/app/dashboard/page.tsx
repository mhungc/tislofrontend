'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Store,
  Package,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Star,
  Plus,
  ArrowRight,
  CalendarDays,
  UserCheck,
  PackageCheck
} from 'lucide-react'

export default function DashboardPage() {
  // Datos de ejemplo - en producción vendrían de la API
  const stats = {
    totalShops: 3,
    totalServices: 12,
    totalBookings: 45,
    totalCustomers: 128,
    revenue: 2840.50,
    revenueChange: 12.5,
    bookingsToday: 8,
    pendingBookings: 5
  }

  const recentBookings = [
    {
      id: '1',
      customerName: 'María García',
      service: 'Corte de Cabello',
      time: '14:00',
      status: 'confirmed',
      shop: 'Peluquería María'
    },
    {
      id: '2',
      customerName: 'Juan Pérez',
      service: 'Tinte',
      time: '16:30',
      status: 'pending',
      shop: 'Peluquería María'
    },
    {
      id: '3',
      customerName: 'Ana López',
      service: 'Manicure',
      time: '10:00',
      status: 'completed',
      shop: 'Spa Relax'
    }
  ]

  const topServices = [
    { name: 'Corte de Cabello', bookings: 15, revenue: 375 },
    { name: 'Tinte', bookings: 8, revenue: 320 },
    { name: 'Manicure', bookings: 12, revenue: 240 },
    { name: 'Pedicure', bookings: 6, revenue: 180 }
  ]

  
const formattedRevenue = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR'
}).format(stats.revenue)


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen de tu negocio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <CalendarDays className="mr-2 h-4 w-4" />
            Ver Calendario
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiendas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShops}</div>
            <p className="text-xs text-muted-foreground">
              +1 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              +2 servicios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookingsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.revenueChange > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              )}
              {Math.abs(stats.revenueChange)}% vs mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Reservas Recientes */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
            <CardDescription>
              Las últimas reservas de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                      <p className="text-xs text-muted-foreground">{booking.shop}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {booking.status === 'confirmed' ? 'Confirmada' :
                       booking.status === 'pending' ? 'Pendiente' : 'Completada'}
                    </Badge>
                    <span className="text-sm font-medium">{booking.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/bookings">
                <Button variant="outline" className="w-full">
                  Ver Todas las Reservas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Servicios Populares */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Servicios Populares</CardTitle>
            <CardDescription>
              Los servicios más solicitados este mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <PackageCheck className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.bookings} reservas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${service.revenue}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((service.revenue / stats.revenue) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/services">
                <Button variant="outline" className="w-full">
                  Gestionar Servicios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/bookings/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nueva Reserva</p>
                      <p className="text-sm text-muted-foreground">Crear cita</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/shops/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nueva Tienda</p>
                      <p className="text-sm text-muted-foreground">Agregar local</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/services/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nuevo Servicio</p>
                      <p className="text-sm text-muted-foreground">Crear servicio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/customers/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nuevo Cliente</p>
                      <p className="text-sm text-muted-foreground">Agregar cliente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas adicionales */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ocupación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hoy</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>Esta semana</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Satisfacción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">4.8</div>
              <div className="flex justify-center text-yellow-600">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Basado en 23 reseñas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Clientes nuevos</span>
                <span className="text-sm font-medium text-green-600">+12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reservas</span>
                <span className="text-sm font-medium text-green-600">+8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ingresos</span>
                <span className="text-sm font-medium text-green-600">+15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
