'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useShopStore } from '@/lib/stores/shop-store'
import { FullBookingCalendar } from '@/components/booking/FullBookingCalendar'
import { MobileBookingList } from '@/components/booking/MobileBookingList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Store, Plus, Smartphone, Monitor } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks/use-mobile'

export default function BookingsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { shops, loading, loadShops } = useShopStore()
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const isMobile = useIsMobile()
  const [forceMobileView, setForceMobileView] = useState(false)

  useEffect(() => {
    loadShops()
  }, [loadShops])



  const selectedShop = shops.find(shop => shop.id === selectedShopId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No tienes tiendas</h3>
          <p className="text-muted-foreground mb-4">
            Crea una tienda para comenzar a recibir reservas
          </p>
          <Button onClick={() => router.push(`/${locale}/dashboard/shops`)}>
            Crear Primera Tienda
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reservas</h1>
            <p className="text-muted-foreground">
              Gestiona las reservas de tus tiendas
            </p>
          </div>
          
          {/* Toggle de vista - solo en desktop */}
          {!isMobile && selectedShopId && (
            <div className="flex items-center gap-2">
              <Button
                variant={forceMobileView ? "outline" : "default"}
                size="sm"
                onClick={() => setForceMobileView(false)}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Calendario
              </Button>
              <Button
                variant={forceMobileView ? "default" : "outline"}
                size="sm"
                onClick={() => setForceMobileView(true)}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Lista
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Store className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Selecciona una tienda" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedShopId && (
            <Button 
              onClick={() => router.push(`/${locale}/dashboard/bookings/new?shop=${selectedShopId}`)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          )}
        </div>
      </div>

      {/* Vista de reservas */}
      {selectedShopId ? (
        (isMobile || forceMobileView) ? (
          <MobileBookingList 
            key={selectedShopId}
            shopId={selectedShopId} 
            shopName={selectedShop?.name || ''}
          />
        ) : (
          <FullBookingCalendar 
            key={selectedShopId}
            shopId={selectedShopId} 
            shopName={selectedShop?.name || ''}
          />
        )
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Selecciona una tienda</h3>
            <p className="text-muted-foreground">
              Elige una tienda para ver sus reservas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}