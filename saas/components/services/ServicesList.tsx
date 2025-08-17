'use client'

import React, { useState, useEffect } from 'react'
import { ServiceService } from '@/lib/services/service-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Clock,
  DollarSign,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface ServicesListProps {
  shopId: string
  onServiceSelect?: (serviceId: string) => void
  onServiceEdit?: (serviceId: string) => void
  className?: string
}

export function ServicesList({
  shopId,
  onServiceSelect,
  onServiceEdit,
  className = ''
}: ServicesListProps) {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const serviceService = new ServiceService()

  // Cargar servicios
  useEffect(() => {
    loadServices()
  }, [shopId])

  const loadServices = async () => {
    setLoading(true)
    try {
      const allServices = await serviceService.getAllShopServices(shopId)
      setServices(allServices)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      toast.error('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar servicios
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterByStatus === 'all' ||
                         (filterByStatus === 'active' && service.is_active) ||
                         (filterByStatus === 'inactive' && !service.is_active)

    return matchesSearch && matchesStatus
  })

  // Cambiar estado de servicio
  const toggleServiceStatus = async (serviceId: string) => {
    try {
      await serviceService.toggleServiceStatus(serviceId)
      toast.success('Estado del servicio actualizado')
      loadServices()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado del servicio')
    }
  }

  // Eliminar servicio
  const deleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }

    try {
      await serviceService.deleteService(serviceId)
      toast.success('Servicio eliminado correctamente')
      loadServices()
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      toast.error('Error al eliminar el servicio')
    }
  }

  // Duplicar servicio
  const duplicateService = async (serviceId: string) => {
    try {
      await serviceService.duplicateService(serviceId)
      toast.success('Servicio duplicado correctamente')
      loadServices()
    } catch (error) {
      console.error('Error al duplicar servicio:', error)
      toast.error('Error al duplicar el servicio')
    }
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
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
              <Package className="h-5 w-5" />
              Servicios ({filteredServices.length})
            </CardTitle>
            <Button
              onClick={() => onServiceEdit?.('new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicios..."
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
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de servicios */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No se encontraron servicios' : 'No hay servicios'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer servicio para comenzar'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => onServiceEdit?.('new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Primer Servicio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Encabezado del servicio */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{service.name}</h3>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceStatus(service.id)}
                      title={service.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {service.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Descripción */}
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Detalles del servicio */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatPrice(service.price)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onServiceSelect?.(service.id)}
                    className="flex-1"
                  >
                    Seleccionar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onServiceEdit?.(service.id)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateService(service.id)}
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteService(service.id)}
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
                {services.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Servicios
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Activos
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {services.filter(s => !s.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Inactivos
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(services.reduce((sum, s) => sum + (s.price || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">
                Valor Total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

