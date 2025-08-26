'use client'

import React, { useState, useEffect } from 'react'
import { BookingService } from '@/lib/services/booking-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Link, Copy, Plus, Calendar, Users, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface BookingLinksProps {
  shopId: string
  shopName: string
}

export function BookingLinks({ shopId, shopName }: BookingLinksProps) {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(30)

  const bookingService = new BookingService()

  useEffect(() => {
    loadLinks()
  }, [shopId])

  const loadLinks = async () => {
    try {
      const data = await bookingService.getBookingLinks(shopId)
      setLinks(data)
    } catch (error) {
      toast.error('Error al cargar enlaces')
    } finally {
      setLoading(false)
    }
  }

  const createLink = async () => {
    setCreating(true)
    try {
      const result = await bookingService.createBookingLink(shopId, expiresInDays)
      await loadLinks()
      setShowCreateForm(false)
      setExpiresInDays(30)
      toast.success('Enlace creado exitosamente')
      
      // Copiar automáticamente al portapapeles
      await navigator.clipboard.writeText(result.url)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      toast.error('Error al crear enlace')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getBaseUrl = () => {
    return typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_APP_URL || ''
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Enlaces de Reserva
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comparte estos enlaces para que tus clientes puedan reservar
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Enlace
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de creación */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Enlace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Expira en (días)</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                El enlace será válido por {expiresInDays} días
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              <Button onClick={createLink} disabled={creating}>
                {creating ? 'Creando...' : 'Crear Enlace'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de enlaces */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay enlaces creados</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer enlace para que los clientes puedan reservar
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Enlace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => {
            const fullUrl = `${getBaseUrl()}/book/${link.token}`
            const expired = isExpired(link.expires_at)
            
            return (
              <Card key={link.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={expired ? "destructive" : link.is_active ? "default" : "secondary"}>
                          {expired ? 'Expirado' : link.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Creado {formatDate(link.created_at)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <code className="text-sm break-all">{fullUrl}</code>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{link.current_uses} usos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expira {formatDate(link.expires_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(fullUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(fullUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}