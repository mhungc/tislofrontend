"use client"

import { Select as ChakraSelect, SelectProps as ChakraSelectProps } from "@chakra-ui/react"
import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }: ChakraSelectProps & { className?: string }) {
  return (
    <ChakraSelect className={cn(className)} {...props}>
      {children}
    </ChakraSelect>
  )
}