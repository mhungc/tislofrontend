// 🏪 Servicio CRUD para Tiendas
import { createClient } from '@/lib/supabase/client'
import type { Shop, ShopInsert, ShopUpdate } from '@/lib/types/database'

export class ShopService {
  private supabase = createClient()

  // 📋 Obtener todas las tiendas del usuario
  async getUserShops(): Promise<Shop[]> {
    const { data: shops, error } = await this.supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener tiendas: ${error.message}`)
    return shops || []
  }

  // 📋 Obtener una tienda específica
  async getShop(shopId: string): Promise<Shop | null> {
    const { data: shop, error } = await this.supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (error) throw new Error(`Error al obtener tienda: ${error.message}`)
    return shop
  }

  // ➕ Crear nueva tienda
  async createShop(shopData: Omit<ShopInsert, 'owner_id'>): Promise<Shop> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: shop, error } = await this.supabase
      .from('shops')
      .insert({
        ...shopData,
        owner_id: user.id
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear tienda: ${error.message}`)
    return shop
  }

  // ✏️ Actualizar tienda
  async updateShop(shopId: string, shopData: ShopUpdate): Promise<Shop> {
    const { data: shop, error } = await this.supabase
      .from('shops')
      .update(shopData)
      .eq('id', shopId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar tienda: ${error.message}`)
    return shop
  }

  // 🗑️ Eliminar tienda
  async deleteShop(shopId: string): Promise<void> {
    const { error } = await this.supabase
      .from('shops')
      .delete()
      .eq('id', shopId)

    if (error) throw new Error(`Error al eliminar tienda: ${error.message}`)
  }

  // 🔄 Cambiar estado de tienda (activar/desactivar)
  async toggleShopStatus(shopId: string): Promise<Shop> {
    const currentShop = await this.getShop(shopId)
    if (!currentShop) throw new Error('Tienda no encontrada')

    return this.updateShop(shopId, {
      is_active: !currentShop.is_active
    })
  }

  // 📊 Obtener estadísticas de la tienda
  async getShopStats(shopId: string) {
    const { data: bookings, error: bookingsError } = await this.supabase
      .from('bookings')
      .select('status, total_amount')
      .eq('shop_id', shopId)

    if (bookingsError) throw new Error(`Error al obtener estadísticas: ${bookingsError.message}`)

    const stats = {
      totalBookings: bookings?.length || 0,
      pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
      totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    }

    return stats
  }
}

