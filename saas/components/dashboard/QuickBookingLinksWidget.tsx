'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShopStore } from '@/lib/stores/shop-store'
import { BookingService } from '@/lib/services/booking-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, Copy, ExternalLink, Store, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface QuickBookingLinksWidgetProps {
  dict: Dictionary['dashboard']
  common: Dictionary['common']
  locale: Locale
}

interface ShopLink {
  shopId: string
  shopName: string
  url: string
  token: string
}

export function QuickBookingLinksWidget({ dict, common, locale }: QuickBookingLinksWidgetProps) {
  const router = useRouter()
  const { shops, loading: shopsLoading, loadShops } = useShopStore()
  const [shopLinks, setShopLinks] = useState<ShopLink[]>([])
  const [loading, setLoading] = useState(true)
  const isEnglish = locale === 'en'
  const bookingService = new BookingService()

  useEffect(() => {
    loadShops()
  }, [loadShops])

  useEffect(() => {
    if (shops && shops.length > 0) {
      loadLinks()
    } else if (!shopsLoading) {
      setLoading(false)
    }
  }, [shops, shopsLoading])

  const loadLinks = async () => {
    if (!Array.isArray(shops) || shops.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    const links: ShopLink[] = []

    await Promise.all(
      shops
        .filter(shop => shop.is_active)
        .map(async (shop) => {
          try {
            const bookingLinks = await bookingService.getBookingLinks(shop.id)
            const activeLink = bookingLinks.find((link: any) =>
              link.is_active && new Date(link.expires_at) > new Date()
            )

            if (activeLink) {
              const baseUrl = typeof window !== 'undefined'
                ? `${window.location.protocol}//${window.location.host}`
                : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

              links.push({
                shopId: shop.id,
                shopName: shop.name,
                url: `${baseUrl}/book/${activeLink.token}`,
                token: activeLink.token
              })
            }
          } catch (error) {
            console.error(`Error loading links for shop ${shop.id}:`, error)
          }
        })
    )

    setShopLinks(links)
    setLoading(false)
  }

  const copyToClipboard = async (url: string, shopName: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(isEnglish ? `${shopName} link copied!` : `¡Enlace de ${shopName} copiado!`)
    } catch (error) {
      toast.error(isEnglish ? 'Error copying link' : 'Error al copiar enlace')
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {isEnglish ? 'Quick Links' : 'Enlaces Rápidos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (shopLinks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {isEnglish ? 'Quick Links' : 'Enlaces Rápidos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Store className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">
            {isEnglish
              ? 'No active shops with booking links yet'
              : 'Aún no hay tiendas activas con enlaces de reserva'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/${locale}/dashboard/shops`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? 'Create Shop' : 'Crear Tienda'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {isEnglish ? 'Quick Booking Links' : 'Enlaces de Reserva Rápidos'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/dashboard/shops`)}
          >
            {isEnglish ? 'View All' : 'Ver Todo'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isEnglish
            ? 'Copy and share your booking links with clients'
            : 'Copia y comparte tus enlaces de reserva con clientes'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {shopLinks.map((link) => (
          <div
            key={link.shopId}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <Store className="h-4 w-4 text-sky-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 mb-1">
                {link.shopName}
              </div>
              <code className="text-xs text-gray-600 truncate block">
                {link.url}
              </code>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(link.url, link.shopName)}
                title={isEnglish ? 'Copy link' : 'Copiar enlace'}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openLink(link.url)}
                title={isEnglish ? 'Open in new tab' : 'Abrir en pestaña nueva'}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
