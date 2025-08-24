import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  modals: {
    createShop: boolean
    editShop: boolean
  }
  loading: {
    global: boolean
    shops: boolean
    auth: boolean
  }
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  modals: {
    createShop: false,
    editShop: false
  },
  loading: {
    global: false,
    shops: false,
    auth: false
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),

  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),

  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  }))
}))