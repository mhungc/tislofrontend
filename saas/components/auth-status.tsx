"use client";

import { useAuth } from '@/lib/hooks/use-stores'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthStatus() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No autenticado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Inicia sesión para continuar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuario autenticado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
        <Button onClick={signOut} variant="outline">
          Cerrar Sesión
        </Button>
      </CardContent>
    </Card>
  )
}