'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserMenu } from '@/components/ui/user-menu'
import { ChakraUIProvider } from '@/components/providers/chakra-provider'
import { CacheProvider } from '@chakra-ui/next-js'
import {
  Box,
  Flex,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Spacer,
} from '@chakra-ui/react'
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
    description: 'Base de datos de clientes',
    comingSoon: true
  },
  {
    title: 'Horarios',
    href: '/dashboard/schedule',
    icon: Clock,
    description: 'Configura disponibilidad',
    comingSoon: true
  },
  {
    title: 'Reportes',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Analytics y metricas',
    comingSoon: true
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Ajustes del sistema',
    comingSoon: true
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useUser()

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'es'

  const isComingSoonPath = [
    '/dashboard/customers',
    '/dashboard/schedule',
    '/dashboard/reports',
    '/dashboard/settings'
  ].some(route => pathname.startsWith(`/${locale}${route}`))

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

  const SidebarContent = () => (
    <VStack spacing={0} align="stretch" h="full">
      <Box p={6} borderBottomWidth="1px">
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          Mi Negocio
        </Text>
      </Box>
      <ScrollArea flex={1}>
        <VStack spacing={1} p={4} align="stretch">
          {localizedNavigation.map((item) => {
            const isActive = pathname === item.href
            const isComingSoon = Boolean(item.comingSoon)

            const content = (
              <HStack
                p={3}
                borderRadius="lg"
                bg={isActive ? 'blue.500' : 'transparent'}
                color={isActive ? 'white' : 'gray.600'}
                _hover={isComingSoon ? {} : { bg: isActive ? 'blue.600' : 'gray.100' }}
                cursor={isComingSoon ? 'not-allowed' : 'pointer'}
                opacity={isComingSoon ? 0.6 : 1}
                transition="all 0.2s"
              >
                <item.icon size={16} />
                <Text fontSize="sm" fontWeight="medium">
                  {item.title}
                </Text>
                {isComingSoon && (
                  <Text fontSize="xs" color={isActive ? 'white' : 'gray.500'}>
                    Proximamente
                  </Text>
                )}
              </HStack>
            )

            return isComingSoon ? (
              <Box key={item.href}>{content}</Box>
            ) : (
              <Link key={item.href} href={item.href}>
                {content}
              </Link>
            )
          })}
        </VStack>
      </ScrollArea>
    </VStack>
  )

  return (
    <CacheProvider>
      <ChakraUIProvider>
        <Box minH="100vh" bg="gray.50">
          {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="64">
          <DrawerCloseButton />
          <SidebarContent />
        </DrawerContent>
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        position="fixed"
        left={0}
        top={0}
        w="64"
        h="100vh"
        bg="white"
        borderRightWidth="1px"
        borderColor="gray.200"
        zIndex={10}
      >
        <SidebarContent />
      </Box>

      {/* Main Content */}
      <Box ml={{ base: 0, lg: '64' }}>
        {/* Header */}
        <Flex
          position="sticky"
          top={0}
          zIndex={40}
          h={16}
          align="center"
          gap={4}
          borderBottomWidth="1px"
          bg="white"
          shadow="sm"
          px={{ base: 4, sm: 6, lg: 8 }}
        >
          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', lg: 'none' }}
            aria-label="Open menu"
            icon={<Menu size={20} />}
            variant="ghost"
            size="sm"
            onClick={onOpen}
          />

          {/* Search */}
          <Flex flex={1} align="center" gap={4}>
            <Box position="relative" flex={1}>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <Input placeholder="Buscar..." pl={10} />
            </Box>
          </Flex>

          {/* Header actions */}
          <HStack spacing={4}>
            
            {/* User menu */}

            {/* Header actions */}
            <HStack spacing={4}>
              {/* Notifications */}
              <IconButton
                aria-label="Notifications"
                icon={<Bell size={20} />}
                variant="ghost"
                size="sm"
              />

              {/* User menu */}
              <UserMenu
                userName={profile?.full_name}
                userEmail={profile?.email || user?.email}
                avatarUrl={profile?.avatar_url}
                loading={loading}
                onSignOut={handleSignOut}
                onProfileClick={() => router.push(`/${locale}/dashboard/profile`)}
                onSettingsClick={() => router.push(`/${locale}/dashboard/settings`)}
              />
            </HStack>
          </HStack>
        </Flex>

        {/* Page content */}
        <Box as="main" py={6}>
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <DemoBanner />
            {isComingSoonPath ? (
              <Box
                p={10}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                textAlign="center"
              >
                <Text fontSize="lg" fontWeight="semibold" mb={2}>
                  Modulo disponible pronto
                </Text>
                <Text color="gray.600">
                  Estamos trabajando en esta seccion. Pronto podras usarla.
                </Text>
              </Box>
            ) : (
              children
            )}
          </Box>
        </Box>
      </Box>
        </Box>
      </ChakraUIProvider>
    </CacheProvider>
  )
}
