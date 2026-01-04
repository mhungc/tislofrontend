"use client";

import * as React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar as ChakraAvatar,
  AvatarBadge,
  Box,
  Text,
  VStack,
} from "@chakra-ui/react";
import { User, Settings, LogOut } from "lucide-react";

interface UserMenuProps {
  userName?: string | null;
  userEmail?: string | null;
  avatarUrl?: string | null;
  loading?: boolean;
  onSignOut: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function UserMenu({
  userName,
  userEmail,
  avatarUrl,
  loading = false,
  onSignOut,
  onProfileClick,
  onSettingsClick,
}: UserMenuProps) {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Box}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ opacity: 0.8 }}
      >
        <ChakraAvatar
          size="sm"
          name={userName || "Usuario"}
          src={avatarUrl || undefined}
          bg="blue.500"
          color="white"
        />
      </MenuButton>
      
      <MenuList
        bg="white"
        borderColor="gray.200"
        shadow="lg"
        minW="224px"
        py={2}
      >
        {/* User Info Header */}
        <Box px={3} py={2} mb={2}>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium" color="gray.900">
              {loading ? "Cargando..." : userName || "Usuario"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {loading ? "" : userEmail || ""}
            </Text>
          </VStack>
        </Box>

        <MenuDivider />

        {/* Menu Items */}
        <MenuItem
          icon={<User size={16} />}
          onClick={onProfileClick}
          _hover={{ bg: "gray.100" }}
        >
          Mi Perfil
        </MenuItem>
        
        <MenuItem
          icon={<Settings size={16} />}
          onClick={onSettingsClick}
          _hover={{ bg: "gray.100" }}
        >
          Configuración
        </MenuItem>

        <MenuDivider />

        <MenuItem
          icon={<LogOut size={16} />}
          onClick={onSignOut}
          _hover={{ bg: "gray.100" }}
          color="red.500"
        >
          Cerrar Sesión
        </MenuItem>
      </MenuList>
    </Menu>
  );
}