import { create } from 'zustand'

interface Shop {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  is_active: boolean
  business_hours?: any
  created_at: string
}

interface ShopState {
  shops: Shop[]
  selectedShop: Shop | null
  loading: boolean
  
  // Actions
  setShops: (shops: Shop[]) => void
  setSelectedShop: (shop: Shop | null) => void
  setLoading: (loading: boolean) => void
  addShop: (shop: Shop) => void
  updateShop: (shopId: string, updates: Partial<Shop>) => void
  removeShop: (shopId: string) => void
  loadShops: () => Promise<void>
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  selectedShop: null,
  loading: false,

  setShops: (shops) => set({ shops }),
  setSelectedShop: (shop) => set({ selectedShop: shop }),
  setLoading: (loading) => set({ loading }),

  addShop: (shop) => set((state) => ({ 
    shops: [shop, ...state.shops] 
  })),

  updateShop: (shopId, updates) => set((state) => ({
    shops: state.shops.map(shop => 
      shop.id === shopId ? { ...shop, ...updates } : shop
    )
  })),

  removeShop: (shopId) => set((state) => ({
    shops: state.shops.filter(shop => shop.id !== shopId)
  })),

  loadShops: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/shops')
      if (response.ok) {
        const data = await response.json()
        const shops = Array.isArray(data.shops) ? data.shops : []
        set({ shops, loading: false })
      } else {
        set({ shops: [], loading: false })
      }
    } catch (error) {
      console.error('Error cargando tiendas:', error)
      set({ shops: [], loading: false })
    }
  }
}))