// 🏪 Servicio CRUD para Tiendas
// Ahora consume nuestras rutas API para mantenerse agnóstico al proveedor
// y facilitar un futuro cambio de backend (.NET, etc.).

export type Shop = {
  id: string
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export class ShopService {
  private async fetchJSON<T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      },
      cache: 'no-store'
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `HTTP ${res.status}`)
    }
    return (await res.json()) as T
  }

  // 📋 Obtener todas las tiendas del usuario
  async getUserShops(): Promise<Shop[]> {
    const data = await this.fetchJSON<{ shops: Shop[] }>('/api/shops')
    return data.shops
  }

  // 📋 Obtener una tienda específica
  async getShop(shopId: string): Promise<Shop | null> {
    const data = await this.fetchJSON<{ shop: Shop }>(`/api/shops/${shopId}`)
    return data.shop
  }

  // ➕ Crear nueva tienda
  async createShop(shopData: Omit<Shop, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Shop> {
    const data = await this.fetchJSON<{ shop: Shop }>(
      '/api/shops',
      { method: 'POST', body: JSON.stringify(shopData) }
    )
    return data.shop
  }

  // ✏️ Actualizar tienda
  async updateShop(shopId: string, shopData: Partial<Shop>): Promise<Shop> {
    const data = await this.fetchJSON<{ shop: Shop }>(
      `/api/shops/${shopId}`,
      { method: 'PATCH', body: JSON.stringify(shopData) }
    )
    return data.shop
  }

  // 🗑️ Eliminar tienda
  async deleteShop(shopId: string): Promise<void> {
    await this.fetchJSON<{ message: string }>(
      `/api/shops/${shopId}`,
      { method: 'DELETE' }
    )
  }

  // 🔄 Cambiar estado de tienda (activar/desactivar)
  async toggleShopStatus(shopId: string): Promise<Shop> {
    const currentShop = await this.getShop(shopId)
    if (!currentShop) throw new Error('Tienda no encontrada')
    return this.updateShop(shopId, { is_active: !currentShop.is_active })
  }

  // 📊 Obtener estadísticas de la tienda
  async getShopStats(shopId: string) {
    // Mantener por ahora desde /bookings en Supabase o futura API
    // Aquí devolvemos una estructura mínima
    return { totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0, totalRevenue: 0 }
  }
}

