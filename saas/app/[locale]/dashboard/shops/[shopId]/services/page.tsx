'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ServicesList } from '@/components/services/ServicesList'
import { ServiceForm } from '@/components/services/ServiceForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Store, Plus } from 'lucide-react'

export default function ShopServicesPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = params.shopId as string
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingServiceId, setEditingServiceId] = useState<string | undefined>()

  useEffect(() => {
    const loadShop = async () => {
      // Validar que shopId sea un UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(shopId)) {
        console.error('ShopId inválido:', shopId)
        router.push('/dashboard/shops')
        return
      }
      
      // Intentar obtener los datos de la tienda desde los parámetros URL
      const shopParam = searchParams.get('shop')
      
      if (shopParam) {
        try {
          const shopData = JSON.parse(decodeURIComponent(shopParam))
          setShop(shopData)
          setLoading(false)
          return
        } catch (error) {
          console.error('Error al parsear datos de tienda:', error)
        }
      }

      // Si no hay datos en URL, hacer fetch como fallback
      try {
        const response = await fetch(`/api/shops/${shopId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setShop(data.shop || data)
        } else if (response.status === 401) {
          router.push('/auth/login')
        } else if (response.status === 400) {
          router.push('/dashboard/shops')
        }
      } catch (error) {
        console.error('Error al cargar tienda:', error)
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      loadShop()
    }
  }, [shopId, router, searchParams])

  const handleCreateNew = () => {
    setEditingServiceId(undefined)
    setMode('create')
  }

  const handleEdit = (serviceId: string) => {
    setEditingServiceId(serviceId)
    setMode('edit')
  }

  const handleFormSuccess = () => {
    setMode('list')
    setEditingServiceId(undefined)
  }

  const handleFormCancel = () => {
    setMode('list')
    setEditingServiceId(undefined)
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          <h1 className="text-2xl font-bold">
            Servicios - {shop?.name || 'Tienda'}
          </h1>
        </div>
        {mode === 'list' && (
          <Button onClick={handleCreateNew} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {/* Información de la tienda */}
      {shop && mode === 'list' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{shop.name}</h2>
                <p className="text-sm text-muted-foreground">{shop.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Gestión de servicios</p>
                <p className="font-medium">Configura los servicios que ofreces</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      {mode === 'list' ? (
        <ServicesList
          shopId={shopId}
          onServiceEdit={handleEdit}
          onCreateNew={handleCreateNew}
          showCreateButton={false}
        />
      ) : (
        <ServiceForm
          shopId={shopId}
          serviceId={editingServiceId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}