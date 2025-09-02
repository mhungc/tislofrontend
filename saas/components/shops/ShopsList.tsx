'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShopStore } from '@/lib/stores/shop-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Filter,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface ShopsListProps {
  onShopSelect?: (shopId: string) => void
  onShopEdit?: (shopId: string) => void
  className?: string
}

export function ShopsList({
  onShopSelect,
  onShopEdit,
  className = ''
}: ShopsListProps) {
  const router = useRouter()
  const { shops, loading, loadShops, updateShop, removeShop } = useShopStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Cargar tiendas
  useEffect(() => {
    loadShops()
  }, [loadShops])

  // Filtrar tiendas
  const filteredShops = Array.isArray(shops) ? shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.address?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterByStatus === 'all' ||
                         (filterByStatus === 'active' && shop.is_active) ||
                         (filterByStatus === 'inactive' && !shop.is_active)

    return matchesSearch && matchesStatus
  }) : []

  // Cambiar estado de tienda
  const toggleShopStatus = async (shopId: string) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/toggle`, { method: 'PATCH' })
      if (response.ok) {
        const updatedShop = await response.json()
        updateShop(shopId, updatedShop)
        toast.success('Estado de la tienda actualizado')
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado de la tienda')
    }
  }

  // Eliminar tienda
  const deleteShop = async (shopId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tienda? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/shops/${shopId}`, { method: 'DELETE' })
      if (response.ok) {
        removeShop(shopId)
        toast.success('Tienda eliminada correctamente')
      }
    } catch (error) {
      console.error('Error al eliminar tienda:', error)
      toast.error('Error al eliminar la tienda')
    }
  }

  // Obtener días abiertos
  const getOpenDays = (businessHours: any) => {
    if (!businessHours) return 0
    return Object.values(businessHours).filter((day: any) => day.is_open).length
  }

  // Formatear horario
  const formatHours = (businessHours: any) => {
    if (!businessHours) return 'No configurado'
    
    const openDays = Object.entries(businessHours).filter(([_, day]: [string, any]) => day.is_open)
    if (openDays.length === 0) return 'Cerrado'
    
    const firstDay = openDays[0][1] as any
    return `${firstDay.open} - ${firstDay.close}`
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Encabezado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Mis Tiendas ({filteredShops.length})
            </CardTitle>
            <Button
              onClick={() => onShopEdit?.('new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Tienda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tiendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterByStatus}
                onChange={(e) => setFilterByStatus(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tiendas */}
      {filteredShops.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No se encontraron tiendas' : 'No tienes tiendas'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primera tienda para comenzar'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => onShopEdit?.('new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Primera Tienda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Encabezado de la tienda */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{shop.name}</h3>
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShopStatus(shop.id)}
                      title={shop.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {shop.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Descripción */}
                {shop.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {shop.description}
                  </p>
                )}

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  {shop.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{shop.address}</span>
                    </div>
                  )}
                  
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  
                  {shop.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{shop.email}</span>
                    </div>
                  )}
                  
                  {shop.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={shop.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline line-clamp-1"
                      >
                        {shop.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Horarios */}
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{getOpenDays(shop.business_hours)} días abiertos</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{formatHours(shop.business_hours)}</span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const locale = window.location.pathname.split('/')[1] || 'es'
                      router.push(`/${locale}/dashboard/shops/${shop.id}/config?shop=${encodeURIComponent(JSON.stringify(shop))}`)
                    }}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configurar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShopEdit?.(shop.id)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteShop(shop.id)}
                    title="Eliminar"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Array.isArray(shops) ? shops.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Tiendas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(shops) ? shops.filter(s => s.is_active).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Activas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Array.isArray(shops) ? shops.filter(s => !s.is_active).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Inactivas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(shops) ? shops.filter(s => s.business_hours).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Con Horarios
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

