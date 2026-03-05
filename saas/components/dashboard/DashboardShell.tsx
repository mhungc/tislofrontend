'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserMenu } from '@/components/ui/user-menu'
import {
  Box,
  Flex,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
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
  Bell,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DemoBanner } from '@/components/demo-banner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface DashboardShellProps {
  children: React.ReactNode
  locale: Locale
  dict: Dictionary
}

export function DashboardShell({ children, locale, dict }: DashboardShellProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useUser()
  const isEnglish = locale === 'en'

  const navigation = [
    {
      title: dict.dashboard.title,
      href: '/dashboard',
      icon: LayoutDashboard,
      comingSoon: false,
    },
    {
      title: dict.shops.title,
      href: '/dashboard/shops',
      icon: Store,
      comingSoon: false,
    },
    {
      title: dict.dashboard.services,
      href: '/dashboard/services',
      icon: Package,
      comingSoon: false,
    },
    {
      title: dict.dashboard.bookings,
      href: '/dashboard/bookings',
      icon: Calendar,
      comingSoon: false,
    },
    {
      title: isEnglish ? 'Customers' : 'Clientes',
      href: '/dashboard/customers',
      icon: Users,
      comingSoon: true,
    },
    {
      title: dict.dashboard.schedule,
      href: '/dashboard/schedule',
      icon: Clock,
      comingSoon: true,
    },
    {
      title: isEnglish ? 'Reports' : 'Reportes',
      href: '/dashboard/reports',
      icon: BarChart3,
      comingSoon: true,
    },
    {
      title: dict.dashboard.settings,
      href: '/dashboard/settings',
      icon: Settings,
      comingSoon: true,
    }
  ]

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

  const localizedNavigation = navigation.map(item => ({
    ...item,
    href: `/${locale}${item.href}`
  }))

  const SidebarContent = () => (
    <VStack spacing={0} align="stretch" h="full">
      <Box p={6} borderBottomWidth="1px">
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          {isEnglish ? 'My Business' : 'Mi Negocio'}
        </Text>
      </Box>
      <ScrollArea flex={1}>
        <VStack spacing={1} p={4} align="stretch">
          {localizedNavigation.map((item) => {
            const isActive = pathname === item.href

            const content = (
              <HStack
                p={3}
                borderRadius="lg"
                bg={isActive ? 'blue.500' : 'transparent'}
                color={isActive ? 'white' : 'gray.600'}
                _hover={item.comingSoon ? {} : { bg: isActive ? 'blue.600' : 'gray.100' }}
                cursor={item.comingSoon ? 'not-allowed' : 'pointer'}
                opacity={item.comingSoon ? 0.6 : 1}
                transition="all 0.2s"
              >
                <item.icon size={16} />
                <Text fontSize="sm" fontWeight="medium">
                  {item.title}
                </Text>
                {item.comingSoon && (
                  <Text fontSize="xs" color={isActive ? 'white' : 'gray.500'}>
                    {isEnglish ? 'Coming soon' : 'Proximamente'}
                  </Text>
                )}
              </HStack>
            )

            return item.comingSoon ? (
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
    <Box minH="100vh" bg="gray.50">
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent maxW="64">
              <DrawerCloseButton />
              <SidebarContent />
            </DrawerContent>
          </Drawer>

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

          <Box ml={{ base: 0, lg: '64' }}>
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
              <IconButton
                display={{ base: 'flex', lg: 'none' }}
                aria-label={isEnglish ? 'Open menu' : 'Abrir menú'}
                icon={<Menu size={20} />}
                variant="ghost"
                size="sm"
                onClick={onOpen}
              />

              <Flex flex={1} align="center" gap={4}>
                <Box position="relative" flex={1}>
                  <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <Input placeholder={isEnglish ? 'Search...' : 'Buscar...'} pl={10} />
                </Box>
              </Flex>

              <HStack spacing={4}>
                <IconButton
                  aria-label={isEnglish ? 'Notifications' : 'Notificaciones'}
                  icon={<Bell size={20} />}
                  variant="ghost"
                  size="sm"
                />

                <UserMenu
                  userName={profile?.full_name}
                  userEmail={profile?.email || user?.email}
                  avatarUrl={profile?.avatar_url}
                  loading={loading}
                  locale={locale}
                  onSignOut={handleSignOut}
                  onProfileClick={() => router.push(`/${locale}/dashboard/profile`)}
                  onSettingsClick={() => router.push(`/${locale}/dashboard/settings`)}
                />
              </HStack>
            </Flex>

            <Box as="main" py={6}>
              <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
                <DemoBanner />
                {isComingSoonPath ? (
                  <Box p={10} borderWidth="1px" borderRadius="lg" bg="white" textAlign="center">
                    <Text fontSize="lg" fontWeight="semibold" mb={2}>
                      {isEnglish ? 'Module coming soon' : 'Modulo disponible pronto'}
                    </Text>
                    <Text color="gray.600">
                      {isEnglish
                        ? 'We are working on this section. You will be able to use it soon.'
                        : 'Estamos trabajando en esta seccion. Pronto podras usarla.'}
                    </Text>
                  </Box>
                ) : (
                  children
                )}
              </Box>
            </Box>
          </Box>
        </Box>
  )
}
