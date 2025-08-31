'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ManualBookingForm } from '@/components/bookings/ManualBookingForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewBookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [shopId, setShopId] = useState<string>('')

  useEffect(() => {
    const shop = searchParams.get('shop')
    if (shop) {
      setShopId(shop)
    } else {
      router.push('/dashboard/bookings')
    }
  }, [searchParams, router])

  const handleSuccess = () => {
    router.push('/dashboard/bookings')
  }

  const handleCancel = () => {
    router.back()
  }

  if (!shopId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Reservas
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Reserva Manual</h1>
          <p className="text-muted-foreground">
            Registra una nueva reserva directamente en el sistema
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ManualBookingForm
          shopId={shopId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}