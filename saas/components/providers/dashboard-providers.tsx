'use client'

import React from 'react'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraUIProvider } from '@/components/providers/chakra-provider'

interface DashboardProvidersProps {
  children: React.ReactNode
}

export function DashboardProviders({ children }: DashboardProvidersProps) {
  return (
    <CacheProvider>
      <ChakraUIProvider>{children}</ChakraUIProvider>
    </CacheProvider>
  )
}
