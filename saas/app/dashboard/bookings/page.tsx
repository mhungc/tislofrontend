'use client'

import React, { useState, useEffect } from 'react'
import { useShopStore } from '@/lib/stores/shop-store'
import { FullBookingCalendar } from '@/components/booking/FullBookingCalendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Store } from 'lucide-react'

export default function BookingsPage() {
  const { shops, loading, loadShops } = useShopStore()
  const [selectedShopId, setSelectedShopId] = useState<string>('')

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
          <Button onClick={() => window.location.href = '/dashboard/shops'}>
            Crear Primera Tienda
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona las reservas de tus tiendas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-64">
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
      </div>

      {/* Calendar */}
      {selectedShopId ? (
        <FullBookingCalendar 
          key={selectedShopId}
          shopId={selectedShopId} 
          shopName={selectedShop?.name || ''}
        />
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