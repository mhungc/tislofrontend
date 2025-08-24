import { useAuthStore } from '@/lib/stores/auth-store'
import { useShopStore } from '@/lib/stores/shop-store'
import { useUIStore } from '@/lib/stores/ui-store'

// Hook combinado para acceder a todos los stores
export function useStores() {
  const auth = useAuthStore()
  const shop = useShopStore()
  const ui = useUIStore()

  return {
    auth,
    shop,
    ui
  }
}

// Hooks específicos para casos comunes
export function useAuth() {
  return useAuthStore()
}

export function useShops() {
  return useShopStore()
}

export function useUI() {
  return useUIStore()
}