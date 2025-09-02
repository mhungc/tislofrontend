'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Search, 
  ArrowRight,
  Settings,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface Shop {
  id: string
  name: string
  description?: string
  address?: string
  is_active: boolean
}

export default function ServicesPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shops', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setShops(data.shops || [])
      } else {
        toast.error('Error al cargar tiendas')
      }
    } catch (error) {
      console.error('Error al cargar tiendas:', error)
      toast.error('Error al cargar tiendas')
    } finally {
      setLoading(false)
    }
  }

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleShopSelect = (shop: Shop) => {
    router.push(`/dashboard/shops/${shop.id}/services?shop=${encodeURIComponent(JSON.stringify(shop))}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los servicios de tus tiendas
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/shops')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      {/* Selector de tienda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Selecciona una tienda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tiendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de tiendas */}
            {filteredShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No se encontraron tiendas' : 'No tienes tiendas'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Crea tu primera tienda para gestionar servicios'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/dashboard/shops')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Tienda
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredShops.map((shop) => (
                  <Card 
                    key={shop.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleShopSelect(shop)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-1">{shop.name}</h3>
                          <Badge variant={shop.is_active ? "default" : "secondary"}>
                            {shop.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {shop.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {shop.description}
                        </p>
                      )}

                      {shop.address && (
                        <p className="text-sm text-muted-foreground mb-4">
                          📍 {shop.address}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Gestionar servicios
                        </span>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {shops.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {shops.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Tiendas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {shops.filter(s => s.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Activas
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {shops.filter(s => !s.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Inactivas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}