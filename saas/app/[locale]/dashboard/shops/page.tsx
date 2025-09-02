'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShopsList } from '@/components/shops/ShopsList'
import { CreateShopForm } from '@/components/shops/CreateShopForm'

export default function ShopsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateSuccess = (shopId?: string) => {
    setShowCreateForm(false)
    setRefreshKey(prev => prev + 1)
    if (shopId) {
      // Get current locale from pathname
      const locale = window.location.pathname.split('/')[1] || 'es'
      router.push(`/${locale}/dashboard/shops/${shopId}/schedule`)
    }
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <CreateShopForm 
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Tiendas</h1>
          <p className="text-muted-foreground">
            Gestiona todas tus tiendas y locales desde un solo lugar.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      {/* Contenido principal */}
      <ShopsList 
        key={refreshKey}
        onShopSelect={(shopId) => console.log('Seleccionar tienda:', shopId)}
        onShopEdit={(shopId) => console.log('Editar tienda:', shopId)}
      />
    </div>
  )
}

