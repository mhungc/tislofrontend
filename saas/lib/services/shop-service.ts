export interface CreateShopData {
  name: string
  description?: string
  address: string
  phone?: string
  email: string
  website?: string
  timezone?: string
}

export class ShopService {
  async createShop(data: CreateShopData) {
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear la tienda')
    }

    const result = await response.json()
    return result.shop || result
  }

  async getShops() {
    const response = await fetch('/api/shops')
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener las tiendas')
    }

    return response.json()
  }

  async getShop(shopId: string) {
    const response = await fetch(`/api/shops/${shopId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener la tienda')
    }

    const data = await response.json()
    return data.shop
  }

  async getUserShops() {
    return this.getShops()
  }

  async toggleShopStatus(shopId: string) {
    const response = await fetch(`/api/shops/${shopId}/toggle`, {
      method: 'PATCH'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al cambiar estado')
    }

    return response.json()
  }

  async updateShop(shopId: string, data: Partial<CreateShopData>) {
    const response = await fetch(`/api/shops/${shopId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar la tienda')
    }

    return response.json()
  }

  async deleteShop(shopId: string) {
    const response = await fetch(`/api/shops/${shopId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar la tienda')
    }

    return response.json()
  }
}