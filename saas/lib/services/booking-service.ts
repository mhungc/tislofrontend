// 📅 Servicio CRUD para Reservas
import { createClient } from '@/lib/supabase/client'
import type { 
  Booking, 
  BookingInsert, 
  BookingUpdate,
  Customer,
  CustomerInsert,
  BookingService,
  BookingServiceInsert,
  Service
} from '@/lib/types/database'

export interface BookingWithDetails extends Booking {
  customer: Customer
  services: (BookingService & { service: Service })[]
  shop: any
}

export interface CreateBookingData {
  shopId: string
  customerData: Omit<CustomerInsert, 'id'>
  bookingData: Omit<BookingInsert, 'shop_id' | 'customer_id' | 'id'>
  serviceIds: string[]
}

export class BookingService {
  private supabase = createClient()

  // 📋 Obtener todas las reservas de una tienda
  async getShopBookings(shopId: string, status?: string): Promise<BookingWithDetails[]> {
    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('shop_id', shopId)
      .order('booking_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) throw new Error(`Error al obtener reservas: ${error.message}`)
    return bookings || []
  }

  // 📋 Obtener reservas por fecha
  async getBookingsByDate(shopId: string, date: string): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('shop_id', shopId)
      .eq('booking_date', date)
      .order('start_time')

    if (error) throw new Error(`Error al obtener reservas por fecha: ${error.message}`)
    return bookings || []
  }

  // 📋 Obtener una reserva específica
  async getBooking(bookingId: string): Promise<BookingWithDetails | null> {
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('id', bookingId)
      .single()

    if (error) throw new Error(`Error al obtener reserva: ${error.message}`)
    return booking
  }

  // ➕ Crear nueva reserva
  async createBooking(bookingData: CreateBookingData): Promise<BookingWithDetails> {
    const { shopId, customerData, bookingData: bookingInfo, serviceIds } = bookingData

    // 1. Crear o encontrar cliente
    let customer: Customer
    if (customerData.email) {
      // Buscar cliente existente por email
      const { data: existingCustomer } = await this.supabase
        .from('customers')
        .select('*')
        .eq('email', customerData.email)
        .single()

      if (existingCustomer) {
        customer = existingCustomer
      } else {
        // Crear nuevo cliente
        const { data: newCustomer, error: customerError } = await this.supabase
          .from('customers')
          .insert(customerData)
          .select()
          .single()

        if (customerError) throw new Error(`Error al crear cliente: ${customerError.message}`)
        customer = newCustomer
      }
    } else {
      // Crear cliente sin email
      const { data: newCustomer, error: customerError } = await this.supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single()

      if (customerError) throw new Error(`Error al crear cliente: ${customerError.message}`)
      customer = newCustomer
    }

    // 2. Obtener servicios y calcular precio total
    const { data: services, error: servicesError } = await this.supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)

    if (servicesError) throw new Error(`Error al obtener servicios: ${servicesError.message}`)
    if (!services || services.length === 0) throw new Error('No se encontraron servicios')

    const totalAmount = services.reduce((sum, service) => sum + (service.price || 0), 0)

    // 3. Crear reserva
    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .insert({
        ...bookingInfo,
        shop_id: shopId,
        customer_id: customer.id,
        total_amount: totalAmount
      })
      .select()
      .single()

    if (bookingError) throw new Error(`Error al crear reserva: ${bookingError.message}`)

    // 4. Crear detalles de servicios
    const bookingServices: BookingServiceInsert[] = services.map(service => ({
      booking_id: booking.id,
      service_id: service.id,
      price: service.price || 0
    }))

    const { error: servicesInsertError } = await this.supabase
      .from('booking_services')
      .insert(bookingServices)

    if (servicesInsertError) throw new Error(`Error al crear detalles de servicios: ${servicesInsertError.message}`)

    // 5. Retornar reserva completa
    return this.getBooking(booking.id) as Promise<BookingWithDetails>
  }

  // ✏️ Actualizar reserva
  async updateBooking(bookingId: string, bookingData: BookingUpdate): Promise<Booking> {
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar reserva: ${error.message}`)
    return booking
  }

  // 🗑️ Eliminar reserva
  async deleteBooking(bookingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) throw new Error(`Error al eliminar reserva: ${error.message}`)
  }

  // 🔄 Cambiar estado de reserva
  async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Booking> {
    return this.updateBooking(bookingId, { status })
  }

  // ✅ Confirmar reserva
  async confirmBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'confirmed')
  }

  // ❌ Cancelar reserva
  async cancelBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'cancelled')
  }

  // ✅ Completar reserva
  async completeBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'completed')
  }

  // 📊 Obtener estadísticas de reservas
  async getBookingStats(shopId: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('bookings')
      .select('status, total_amount, booking_date')
      .eq('shop_id', shopId)

    if (startDate) {
      query = query.gte('booking_date', startDate)
    }
    if (endDate) {
      query = query.lte('booking_date', endDate)
    }

    const { data: bookings, error } = await query

    if (error) throw new Error(`Error al obtener estadísticas: ${error.message}`)

    const stats = {
      totalBookings: bookings?.length || 0,
      pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      cancelledBookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
      completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
      totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      averageRevenue: bookings && bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length 
        : 0
    }

    return stats
  }

  // 📅 Obtener reservas por rango de fechas
  async getBookingsByDateRange(shopId: string, startDate: string, endDate: string): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('shop_id', shopId)
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: true })

    if (error) throw new Error(`Error al obtener reservas por rango: ${error.message}`)
    return bookings || []
  }

  // 👤 Obtener reservas de un cliente
  async getCustomerBookings(customerId: string): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false })

    if (error) throw new Error(`Error al obtener reservas del cliente: ${error.message}`)
    return bookings || []
  }

  // 🔍 Buscar reservas por cliente
  async searchBookingsByCustomer(shopId: string, searchTerm: string): Promise<BookingWithDetails[]> {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('shop_id', shopId)
      .or(`customer.full_name.ilike.%${searchTerm}%,customer.email.ilike.%${searchTerm}%,customer.phone.ilike.%${searchTerm}%`)
      .order('booking_date', { ascending: false })

    if (error) throw new Error(`Error al buscar reservas: ${error.message}`)
    return bookings || []
  }

  // 📋 Validar disponibilidad para nueva reserva
  async validateBookingAvailability(
    shopId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<{ available: boolean; message?: string }> {
    let query = this.supabase
      .from('bookings')
      .select('id')
      .eq('shop_id', shopId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }

    const { data: conflictingBookings, error } = await query

    if (error) throw new Error(`Error al validar disponibilidad: ${error.message}`)

    const hasConflict = (conflictingBookings?.length || 0) > 0

    return {
      available: !hasConflict,
      message: hasConflict ? 'Horario no disponible' : undefined
    }
  }

  // 📊 Obtener próximas reservas
  async getUpcomingBookings(shopId: string, limit: number = 10): Promise<BookingWithDetails[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        services:booking_services(
          *,
          service:services(*)
        ),
        shop:shops(*)
      `)
      .eq('shop_id', shopId)
      .gte('booking_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) throw new Error(`Error al obtener próximas reservas: ${error.message}`)
    return bookings || []
  }
}

