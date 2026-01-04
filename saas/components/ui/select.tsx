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

export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
)
export const SelectTrigger = ({ children, className, ...props }: any) => (
  <ChakraSelect className={cn(className)} {...props}>
    {children}
  </ChakraSelect>
)
export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>{placeholder}</option>
)