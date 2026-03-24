'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShopStore } from '@/lib/stores/shop-store'
import { BookingService } from '@/lib/services/booking-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Store, Edit, Trash2, Eye, EyeOff, MapPin, Phone, Mail, Globe, Clock, Filter, Settings, Copy, Link2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface ShopsListProps {
  locale: Locale
  shopsDict: Dictionary['shops']
  commonDict: Dictionary['common']
  className?: string
}

export function ShopsList({ locale, shopsDict, commonDict, className = '' }: ShopsListProps) {
  const router = useRouter()
  const { shops, loading, loadShops, updateShop, removeShop } = useShopStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [bookingLinks, setBookingLinks] = useState<Record<string, { token: string; url: string; is_active: boolean; expires_at: string } | null>>({})
  const [loadingLinks, setLoadingLinks] = useState(false)
  const isEnglish = locale === 'en'
  const bookingService = new BookingService()

  useEffect(() => {
    loadShops()
  }, [loadShops])

  useEffect(() => {
    if (shops && shops.length > 0 && !loadingLinks) {
      loadBookingLinks()
    }
  }, [shops])

  const loadBookingLinks = async () => {
    if (loadingLinks || !Array.isArray(shops) || shops.length === 0) return
    
    setLoadingLinks(true)
    const linksData: Record<string, { token: string; url: string; is_active: boolean; expires_at: string } | null> = {}
    
    await Promise.all(
      shops.map(async (shop) => {
        try {
          const links = await bookingService.getBookingLinks(shop.id)
          // Encontrar el primer link activo y no expirado
          const activeLink = links.find((link: any) => 
            link.is_active && new Date(link.expires_at) > new Date()
          )
          
          if (activeLink) {
            const baseUrl = typeof window !== 'undefined'
              ? `${window.location.protocol}//${window.location.host}`
              : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
            
            linksData[shop.id] = {
              token: activeLink.token,
              url: `${baseUrl}/book/${activeLink.token}`,
              is_active: activeLink.is_active,
              expires_at: activeLink.expires_at
            }
          } else {
            linksData[shop.id] = null
          }
        } catch (error) {
          console.error(`Error loading links for shop ${shop.id}:`, error)
          linksData[shop.id] = null
        }
      })
    )
    
    setBookingLinks(linksData)
    setLoadingLinks(false)
  }

  const copyBookingUrl = async (url: string, shopName: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(isEnglish ? `Copied ${shopName} booking link!` : `¡Enlace de ${shopName} copiado!`)
    } catch (error) {
      toast.error(isEnglish ? 'Error copying link' : 'Error al copiar enlace')
    }
  }

  const createBookingLink = async (shopId: string) => {
    try {
      const result = await bookingService.createBookingLink(shopId, 365)
      await loadBookingLinks()
      toast.success(isEnglish ? 'Booking link created!' : '¡Enlace de reserva creado!')
    } catch (error) {
      toast.error(isEnglish ? 'Error creating link' : 'Error al crear enlace')
    }
  }

  const filteredShops = Array.isArray(shops)
    ? shops.filter(shop => {
        const matchesSearch =
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.address?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
          filterByStatus === 'all' ||
          (filterByStatus === 'active' && shop.is_active) ||
          (filterByStatus === 'inactive' && !shop.is_active)

        return matchesSearch && matchesStatus
      })
    : []

  const toggleShopStatus = async (shopId: string) => {
    try {
      const response = await fetch(`/api/shops/${shopId}/toggle`, { method: 'PATCH' })
      if (response.ok) {
        const updatedShop = await response.json()
        updateShop(shopId, updatedShop)
        toast.success(isEnglish ? 'Shop status updated' : 'Estado de la tienda actualizado')
      }
    } catch {
      toast.error(isEnglish ? 'Error changing shop status' : 'Error al cambiar el estado de la tienda')
    }
  }

  const deleteShop = async (shopId: string) => {
    const confirmationMessage = shopsDict.form.deleteConfirm || (isEnglish
      ? 'Are you sure you want to delete this shop? This action cannot be undone.'
      : '¿Estás seguro de que quieres eliminar esta tienda? Esta acción no se puede deshacer.')

    if (!confirm(confirmationMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/shops/${shopId}`, { method: 'DELETE' })
      if (response.ok) {
        removeShop(shopId)
        toast.success(shopsDict.form.deleteSuccess)
      }
    } catch {
      toast.error(isEnglish ? 'Error deleting shop' : 'Error al eliminar la tienda')
    }
  }

  const getOpenDays = (businessHours: any) => {
    if (!businessHours) return 0
    return Object.values(businessHours).filter((day: any) => day.is_open).length
  }

  const formatHours = (businessHours: any) => {
    if (!businessHours) return shopsDict.notConfigured
    const openDays = Object.entries(businessHours).filter(([_, day]: [string, any]) => day.is_open)
    if (openDays.length === 0) return shopsDict.closed
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {shopsDict.title} ({filteredShops.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder={shopsDict.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterByStatus}
                onChange={(e) => setFilterByStatus(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">{shopsDict.all}</option>
                <option value="active">{shopsDict.active}</option>
                <option value="inactive">{shopsDict.inactive}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredShops.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? (isEnglish ? 'No shops found' : 'No se encontraron tiendas') : shopsDict.noShops}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? (isEnglish ? 'Try different search terms' : 'Intenta con otros términos de búsqueda') : shopsDict.noShopsDescription}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{shop.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                        {shop.is_active ? commonDict.active : commonDict.inactive}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={shop.bookingConfirmationMode === 'automatic' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}
                      >
                        {shop.bookingConfirmationMode === 'automatic' ? '⚡ Auto' : '✋ Manual'}
                      </Badge>
                      {typeof shop.base_slot_minutes === 'number' && (
                        <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 border border-gray-200 bg-gray-50 text-gray-700">
                          Franjas: {shop.base_slot_minutes} min
                        </Badge>
                      )}
                      {typeof shop.buffer_minutes === 'number' && shop.buffer_minutes > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs px-2 py-0.5 border border-gray-200 bg-gray-50 text-gray-700">
                          Buffer: {shop.buffer_minutes} min
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShopStatus(shop.id)}
                      title={shop.is_active ? (isEnglish ? 'Deactivate' : 'Desactivar') : (isEnglish ? 'Activate' : 'Activar')}
                    >
                      {shop.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {shop.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{shop.description}</p>}

                <div className="space-y-2 mb-4">
                  {shop.address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="line-clamp-1">{shop.address}</span></div>}
                  {shop.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{shop.phone}</span></div>}
                  {shop.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="line-clamp-1">{shop.email}</span></div>}
                  {shop.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline line-clamp-1">
                        {shop.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{getOpenDays(shop.business_hours)} {shopsDict.openDays}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{formatHours(shop.business_hours)}</span>
                </div>

                {/* Booking URL - Quick Access */}
                <div className="mb-4 p-3 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-lg">
                  {bookingLinks[shop.id] ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-sky-700">
                        <Link2 className="h-3 w-3" />
                        <span>{isEnglish ? 'Booking Link' : 'Enlace de Reservas'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-white px-2 py-1 rounded border truncate">
                          {bookingLinks[shop.id]?.url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyBookingUrl(bookingLinks[shop.id]!.url, shop.name)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        <span>{isEnglish ? 'No booking link' : 'Sin enlace de reserva'}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => createBookingLink(shop.id)}
                        className="h-7 text-xs"
                      >
                        {isEnglish ? 'Create' : 'Crear'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${locale}/dashboard/shops/${shop.id}/config?shop=${encodeURIComponent(JSON.stringify(shop))}`)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {shopsDict.configure}
                  </Button>
                  <Button variant="ghost" size="sm" title={commonDict.edit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteShop(shop.id)}
                    title={commonDict.delete}
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

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{Array.isArray(shops) ? shops.length : 0}</div>
              <div className="text-sm text-muted-foreground">{shopsDict.totalShops}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Array.isArray(shops) ? shops.filter(s => s.is_active).length : 0}</div>
              <div className="text-sm text-muted-foreground">{shopsDict.activeShops}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{Array.isArray(shops) ? shops.filter(s => !s.is_active).length : 0}</div>
              <div className="text-sm text-muted-foreground">{shopsDict.inactiveShops}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Array.isArray(shops) ? shops.filter(s => s.business_hours).length : 0}</div>
              <div className="text-sm text-muted-foreground">{shopsDict.withSchedule}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

