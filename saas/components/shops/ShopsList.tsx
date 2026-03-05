'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'es'
  const isEnglish = locale === 'en'
  const t = {
    statusUpdated: isEnglish ? 'Shop status updated' : 'Estado de la tienda actualizado',
    statusUpdateError: isEnglish ? 'Error changing shop status' : 'Error al cambiar el estado de la tienda',
    deleteConfirm: isEnglish
      ? 'Are you sure you want to delete this shop? This action cannot be undone.'
      : '¿Estás seguro de que quieres eliminar esta tienda? Esta acción no se puede deshacer.',
    deleted: isEnglish ? 'Shop deleted successfully' : 'Tienda eliminada correctamente',
    deleteError: isEnglish ? 'Error deleting shop' : 'Error al eliminar la tienda',
    notConfigured: isEnglish ? 'Not configured' : 'No configurado',
    closed: isEnglish ? 'Closed' : 'Cerrado',
    title: isEnglish ? 'My Shops' : 'Mis Tiendas',
    searchPlaceholder: isEnglish ? 'Search shops...' : 'Buscar tiendas...',
    all: isEnglish ? 'All' : 'Todas',
    active: isEnglish ? 'Active' : 'Activas',
    inactive: isEnglish ? 'Inactive' : 'Inactivas',
    noneFound: isEnglish ? 'No shops found' : 'No se encontraron tiendas',
    noShops: isEnglish ? 'You have no shops' : 'No tienes tiendas',
    tryOtherSearch: isEnglish ? 'Try different search terms' : 'Intenta con otros términos de búsqueda',
    createFirstShop: isEnglish ? 'Create your first shop to get started' : 'Crea tu primera tienda para comenzar',
    useNewShop: isEnglish ? 'Use the "New Shop" button to start.' : 'Usa el boton "Nueva Tienda" para empezar.',
    activeSingle: isEnglish ? 'Active' : 'Activa',
    inactiveSingle: isEnglish ? 'Inactive' : 'Inactiva',
    auto: isEnglish ? '⚡ Auto' : '⚡ Auto',
    manual: isEnglish ? '✋ Manual' : '✋ Manual',
    deactivate: isEnglish ? 'Deactivate' : 'Desactivar',
    activate: isEnglish ? 'Activate' : 'Activar',
    openDays: isEnglish ? 'open days' : 'días abiertos',
    configure: isEnglish ? 'Configure' : 'Configurar',
    edit: isEnglish ? 'Edit' : 'Editar',
    remove: isEnglish ? 'Delete' : 'Eliminar',
    totalShops: isEnglish ? 'Total Shops' : 'Total Tiendas',
    activeShops: isEnglish ? 'Active' : 'Activas',
    inactiveShops: isEnglish ? 'Inactive' : 'Inactivas',
    withSchedule: isEnglish ? 'With Schedule' : 'Con Horarios',
  }
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
        toast.success(t.statusUpdated)
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error(t.statusUpdateError)
    }
  }

  // Eliminar tienda
  const deleteShop = async (shopId: string) => {
    if (!confirm(t.deleteConfirm)) {
      return
    }

    try {
      const response = await fetch(`/api/shops/${shopId}`, { method: 'DELETE' })
      if (response.ok) {
        removeShop(shopId)
        toast.success(t.deleted)
      }
    } catch (error) {
      console.error('Error al eliminar tienda:', error)
      toast.error(t.deleteError)
    }
  }

  // Obtener días abiertos
  const getOpenDays = (businessHours: any) => {
    if (!businessHours) return 0
    return Object.values(businessHours).filter((day: any) => day.is_open).length
  }

  // Formatear horario
  const formatHours = (businessHours: any) => {
    if (!businessHours) return t.notConfigured
    
    const openDays = Object.entries(businessHours).filter(([_, day]: [string, any]) => day.is_open)
    if (openDays.length === 0) return t.closed
    
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
              {t.title} ({filteredShops.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <Input
                placeholder="Buscar tiendas..."
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">{t.all}</option>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
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
              {searchTerm ? t.noneFound : t.noShops}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? t.tryOtherSearch
                : t.createFirstShop
              }
            </p>
            {!searchTerm && (
              <p className="text-xs text-muted-foreground">
                {t.useNewShop}
              </p>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={shop.is_active ? "default" : "secondary"}>
                        {shop.is_active ? t.activeSingle : t.inactiveSingle}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={shop.bookingConfirmationMode === 'automatic' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}
                      >
                        {shop.bookingConfirmationMode === 'automatic' ? t.auto : t.manual}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShopStatus(shop.id)}
                      title={shop.is_active ? t.deactivate : t.activate}
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
                  <span>{getOpenDays(shop.business_hours)} {t.openDays}</span>
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
                    {t.configure}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShopEdit?.(shop.id)}
                    title={t.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteShop(shop.id)}
                    title={t.remove}
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
                {t.totalShops}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(shops) ? shops.filter(s => s.is_active).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.activeShops}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Array.isArray(shops) ? shops.filter(s => !s.is_active).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.inactiveShops}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(shops) ? shops.filter(s => s.business_hours).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t.withSchedule}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

