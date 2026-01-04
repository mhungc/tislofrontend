"use client";

import * as React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  RadioGroup,
  Radio,
  type MenuButtonProps,
  type MenuListProps,
  type MenuItemProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ children, ...props }: { children: React.ReactNode }) {
  return <Menu placement="bottom-end" {...props}>{children}</Menu>;
}

export { MenuDivider as DropdownMenuSeparator };

interface DropdownMenuTriggerProps extends Omit<MenuButtonProps, 'as'> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ className, asChild, children, ...props }, ref) {
    return (
      <MenuButton 
        ref={ref} 
        className={className}
        p={0}
        m={0}
        border="none"
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
        _focus={{ boxShadow: "none", outline: "none" }}
        _expanded={{ bg: "transparent" }}
        minW="auto"
        h="auto"
        w="auto"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        {...props}
      >
        {children}
      </MenuButton>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, MenuListProps>(
  function DropdownMenuContent({ className, ...props }, ref) {
    return (
      <MenuList
        ref={ref as any}
        className={className}
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        shadow="lg"
        minW="224px"
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  function DropdownMenuItem({ className, ...props }, ref) {
    return (
      <MenuItem
        ref={ref as any}
        className={className}
        _hover={{ bg: "gray.100" }}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", className)}
        {...props}
      />
    );
  }
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }>(
  function DropdownMenuRadioGroup({ value, onValueChange, children, ...props }, ref) {
    return (
      <RadioGroup value={value} onChange={onValueChange} {...props}>
        {children}
      </RadioGroup>
    );
  }
);
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, { value: string; className?: string; children: React.ReactNode }>(
  function DropdownMenuRadioItem({ value, className, children, ...props }, ref) {
    return (
      <MenuItem
        ref={ref as any}
        className={className}
        _hover={{ bg: "gray.100" }}
        as={Radio}
        value={value}
        {...props}
      >
        {children}
      </MenuItem>
    );
  }
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";