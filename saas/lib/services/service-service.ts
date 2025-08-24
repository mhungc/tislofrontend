// 🛠️ Servicio CRUD para Servicios de Tiendas
export interface ServiceData {
  id?: string
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  is_active?: boolean
}

export class ServiceService {

  // 📋 Obtener todos los servicios de una tienda
  async getShopServices(shopId: string): Promise<any[]> {
    const response = await fetch(`/api/shops/${shopId}/services`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener servicios')
    }
    
    const data = await response.json()
    return data.services || []
  }

  // 📋 Obtener un servicio específico
  async getService(shopId: string, serviceId: string): Promise<any | null> {
    const response = await fetch(`/api/shops/${shopId}/services/${serviceId}`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener servicio')
    }
    
    const data = await response.json()
    return data.service
  }

  // ➕ Crear nuevo servicio
  async createService(shopId: string, service: Omit<ServiceData, 'id'>): Promise<any> {
    const response = await fetch(`/api/shops/${shopId}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(service),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear servicio')
    }

    const data = await response.json()
    return data.service
  }

  // ✏️ Actualizar servicio
  async updateService(shopId: string, serviceId: string, updates: Partial<ServiceData>): Promise<any> {
    const response = await fetch(`/api/shops/${shopId}/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar servicio')
    }

    const data = await response.json()
    return data.service
  }

  // 🗑️ Eliminar servicio
  async deleteService(shopId: string, serviceId: string): Promise<void> {
    const response = await fetch(`/api/shops/${shopId}/services/${serviceId}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar servicio')
    }
  }

  // 🔄 Cambiar estado de servicio (activar/desactivar)
  async toggleServiceStatus(shopId: string, serviceId: string): Promise<any> {
    const response = await fetch(`/api/shops/${shopId}/services/${serviceId}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al cambiar estado del servicio')
    }

    const data = await response.json()
    return data.service
  }
}