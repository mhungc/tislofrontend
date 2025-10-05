'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Store,
  Package,
  Calendar,
  Users,
  Clock,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { DemoBanner } from '@/components/demo-banner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general de tu negocio'
  },
  {
    title: 'Mis Tiendas',
    href: '/dashboard/shops',
    icon: Store,
    description: 'Gestiona tus tiendas'
  },
  {
    title: 'Servicios',
    href: '/dashboard/services',
    icon: Package,
    description: 'Configura tus servicios'
  },
  {
    title: 'Reservas',
    href: '/dashboard/bookings',
    icon: Calendar,
    description: 'Gestiona las citas'
  },
  {
    title: 'Clientes',
    href: '/dashboard/customers',
    icon: Users,
    description: 'Base de datos de clientes'
  },
  {
    title: 'Horarios',
    href: '/dashboard/schedule',
    icon: Clock,
    description: 'Configura disponibilidad'
  },
  {
    title: 'Reportes',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Analytics y métricas'
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Ajustes del sistema'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useUser()
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'es'
  
  const handleSignOut = async () => {
    await signOut()
    router.push(`/${locale}/auth/login`)
  }
  
  // Función para obtener iniciales del nombre
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  // Create localized navigation
  const localizedNavigation = navigation.map(item => ({
    ...item,
    href: `/${locale}${item.href}`
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móviles */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h2 className="text-lg font-semibold">Mi Negocio</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-2">
              {localizedNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-primary">Mi Negocio</h1>
          </div>

          {/* Navegación */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {localizedNavigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Botón menú móvil */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          {/* Buscador */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8"
              />
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notificaciones */}
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Separador */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

            {/* Perfil del usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profile?.avatar_url || undefined} 
                      alt={profile?.full_name || 'Usuario'} 
                    />
                    <AvatarFallback>
                      {loading ? '...' : getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {loading ? 'Cargando...' : (profile?.full_name || 'Usuario')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {loading ? '' : (profile?.email || user?.email || '')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <DemoBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
