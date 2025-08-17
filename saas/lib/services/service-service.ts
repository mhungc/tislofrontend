// 🛠️ Servicio CRUD para Servicios de Tiendas
import { createClient } from '@/lib/supabase/client'
import type { Service, ServiceInsert, ServiceUpdate } from '@/lib/types/database'

export class ServiceService {
  private supabase = createClient()

  // 📋 Obtener todos los servicios de una tienda
  async getShopServices(shopId: string): Promise<Service[]> {
    const { data: services, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error(`Error al obtener servicios: ${error.message}`)
    return services || []
  }

  // 📋 Obtener todos los servicios (incluyendo inactivos)
  async getAllShopServices(shopId: string): Promise<Service[]> {
    const { data: services, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('shop_id', shopId)
      .order('name')

    if (error) throw new Error(`Error al obtener servicios: ${error.message}`)
    return services || []
  }

  // 📋 Obtener un servicio específico
  async getService(serviceId: string): Promise<Service | null> {
    const { data: service, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (error) throw new Error(`Error al obtener servicio: ${error.message}`)
    return service
  }

  // ➕ Crear nuevo servicio
  async createService(serviceData: Omit<ServiceInsert, 'shop_id'>, shopId: string): Promise<Service> {
    const { data: service, error } = await this.supabase
      .from('services')
      .insert({
        ...serviceData,
        shop_id: shopId
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear servicio: ${error.message}`)
    return service
  }

  // ✏️ Actualizar servicio
  async updateService(serviceId: string, serviceData: ServiceUpdate): Promise<Service> {
    const { data: service, error } = await this.supabase
      .from('services')
      .update(serviceData)
      .eq('id', serviceId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar servicio: ${error.message}`)
    return service
  }

  // 🗑️ Eliminar servicio (soft delete)
  async deleteService(serviceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId)

    if (error) throw new Error(`Error al eliminar servicio: ${error.message}`)
  }

  // 🔄 Cambiar estado de servicio (activar/desactivar)
  async toggleServiceStatus(serviceId: string): Promise<Service> {
    const currentService = await this.getService(serviceId)
    if (!currentService) throw new Error('Servicio no encontrado')

    return this.updateService(serviceId, {
      is_active: !currentService.is_active
    })
  }

  // 📊 Obtener estadísticas de servicios
  async getServiceStats(shopId: string) {
    const { data: services, error: servicesError } = await this.supabase
      .from('services')
      .select('id, name, price')
      .eq('shop_id', shopId)
      .eq('is_active', true)

    if (servicesError) throw new Error(`Error al obtener servicios: ${servicesError.message}`)

    // Obtener reservas para cada servicio
    const serviceStats = await Promise.all(
      (services || []).map(async (service) => {
        const { data: bookings, error: bookingsError } = await this.supabase
          .from('booking_services')
          .select('price, created_at')
          .eq('service_id', service.id)

        if (bookingsError) throw new Error(`Error al obtener reservas: ${bookingsError.message}`)

        const totalBookings = bookings?.length || 0
        const totalRevenue = bookings?.reduce((sum, b) => sum + b.price, 0) || 0

        return {
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          totalBookings,
          totalRevenue,
          averageRevenue: totalBookings > 0 ? totalRevenue / totalBookings : 0
        }
      })
    )

    return serviceStats
  }

  // 🔍 Buscar servicios por nombre
  async searchServices(shopId: string, searchTerm: string): Promise<Service[]> {
    const { data: services, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`)
      .order('name')

    if (error) throw new Error(`Error al buscar servicios: ${error.message}`)
    return services || []
  }

  // 📋 Obtener servicios por rango de precios
  async getServicesByPriceRange(shopId: string, minPrice: number, maxPrice: number): Promise<Service[]> {
    const { data: services, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('price')

    if (error) throw new Error(`Error al obtener servicios por precio: ${error.message}`)
    return services || []
  }

  // 📊 Obtener servicios más populares
  async getPopularServices(shopId: string, limit: number = 5): Promise<any[]> {
    const { data: popularServices, error } = await this.supabase
      .from('booking_services')
      .select(`
        service_id,
        services!inner(name, price),
        count
      `)
      .eq('services.shop_id', shopId)
      .group('service_id, services.name, services.price')
      .order('count', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Error al obtener servicios populares: ${error.message}`)
    return popularServices || []
  }

  // 🔄 Duplicar servicio
  async duplicateService(serviceId: string): Promise<Service> {
    const originalService = await this.getService(serviceId)
    if (!originalService) throw new Error('Servicio no encontrado')

    const { name, description, duration_minutes, price } = originalService
    
    return this.createService({
      name: `${name} (Copia)`,
      description,
      duration_minutes,
      price,
      is_active: true
    }, originalService.shop_id)
  }

  // 📋 Validar disponibilidad de servicio
  async validateServiceAvailability(
    serviceId: string, 
    date: string, 
    startTime: string
  ): Promise<{ available: boolean; message?: string }> {
    const service = await this.getService(serviceId)
    if (!service) {
      return { available: false, message: 'Servicio no encontrado' }
    }

    // Calcular hora de fin basada en la duración del servicio
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000)
    const endTime = end.toTimeString().slice(0, 5)

    // Verificar si hay reservas conflictivas
    const { data: conflictingBookings, error } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('shop_id', service.shop_id)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)

    if (error) throw new Error(`Error al validar disponibilidad: ${error.message}`)

    const hasConflict = (conflictingBookings?.length || 0) > 0

    return {
      available: !hasConflict,
      message: hasConflict ? 'Horario no disponible' : undefined
    }
  }
}

