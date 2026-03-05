'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ShopsList } from '@/components/shops/ShopsList'
import { CreateShopForm } from '@/components/shops/CreateShopForm'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface ShopsPageClientProps {
  locale: Locale
  dict: Dictionary
}

export function ShopsPageClient({ locale, dict }: ShopsPageClientProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateSuccess = (shopId?: string, shopData?: any) => {
    setShowCreateForm(false)
    setRefreshKey(prev => prev + 1)
    if (shopId && shopData) {
      const shopParam = encodeURIComponent(JSON.stringify(shopData))
      router.push(`/${locale}/dashboard/shops/${shopId}/schedule?shop=${shopParam}`)
    }
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <CreateShopForm
          locale={locale}
          shopsDict={dict.shops}
          commonDict={dict.common}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dict.shops.title}</h1>
          <p className="text-muted-foreground">{dict.shops.description}</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {dict.shops.newShop}
        </Button>
      </div>

      <ShopsList
        key={refreshKey}
        locale={locale}
        shopsDict={dict.shops}
        commonDict={dict.common}
      />
    </div>
  )
}
