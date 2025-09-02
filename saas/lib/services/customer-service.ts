// 👥 Servicio CRUD para Clientes
import { createClient } from '@/lib/supabase/client'
import type { Customer, CustomerInsert, CustomerUpdate, Booking } from '@/lib/types/database'

export interface CustomerWithBookings extends Customer {
  bookings: Booking[]
}

export class CustomerService {
  private supabase = createClient()

  // 📋 Obtener todos los clientes de una tienda
  async getShopCustomers(shopId: string): Promise<Customer[]> {
    const { data: customers, error } = await this.supabase
      .from('customers')
      .select(`
        *,
        bookings!inner(shop_id)
      `)
      .eq('bookings.shop_id', shopId)
      .order('full_name')

    if (error) throw new Error(`Error al obtener clientes: ${error.message}`)
    return customers || []
  }

  // 📋 Obtener un cliente específico
  async getCustomer(customerId: string): Promise<Customer | null> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) throw new Error(`Error al obtener cliente: ${error.message}`)
    return customer
  }

  // ➕ Crear nuevo cliente
  async createCustomer(customerData: Omit<CustomerInsert, 'id'>): Promise<Customer> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) throw new Error(`Error al crear cliente: ${error.message}`)
    return customer
  }

  // ✏️ Actualizar cliente
  async updateCustomer(customerId: string, customerData: CustomerUpdate): Promise<Customer> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .update(customerData)
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar cliente: ${error.message}`)
    return customer
  }

  // 🗑️ Eliminar cliente
  async deleteCustomer(customerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (error) throw new Error(`Error al eliminar cliente: ${error.message}`)
  }

  // 🔍 Buscar cliente por email
  async findCustomerByEmail(email: string): Promise<Customer | null> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error al buscar cliente: ${error.message}`)
    }
    return customer
  }

  // 🔍 Buscar cliente por teléfono
  async findCustomerByPhone(phone: string): Promise<Customer | null> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al buscar cliente: ${error.message}`)
    }
    return customer
  }

  // 🔍 Buscar clientes por nombre
  async searchCustomersByName(shopId: string, searchTerm: string): Promise<Customer[]> {
    const { data: customers, error } = await this.supabase
      .from('customers')
      .select(`
        *,
        bookings!inner(shop_id)
      `)
      .eq('bookings.shop_id', shopId)
      .ilike('full_name', `%${searchTerm}%`)
      .order('full_name')

    if (error) throw new Error(`Error al buscar clientes: ${error.message}`)
    return customers || []
  }

  // 📊 Obtener cliente con historial de reservas
  async getCustomerWithBookings(customerId: string): Promise<CustomerWithBookings | null> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .select(`
        *,
        bookings(*)
      `)
      .eq('id', customerId)
      .single()

    if (error) throw new Error(`Error al obtener cliente con reservas: ${error.message}`)
    return customer
  }

  // 📊 Obtener estadísticas de cliente
  async getCustomerStats(customerId: string) {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select('status, total_amount, created_at')
      .eq('customer_id', customerId)

    if (error) throw new Error(`Error al obtener estadísticas: ${error.message}`)

    const stats = {
      totalBookings: bookings?.length || 0,
      pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelledBookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
      totalSpent: bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      averageSpent: bookings && bookings.length > 0 
        ? bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookings.length 
        : 0,
      firstBooking: bookings?.length > 0 
        ? new Date(Math.min(...bookings.map(b => new Date(b.created_at).getTime())))
        : null,
      lastBooking: bookings?.length > 0 
        ? new Date(Math.max(...bookings.map(b => new Date(b.created_at).getTime())))
        : null
    }

    return stats
  }

  // 📊 Obtener clientes más frecuentes
  async getTopCustomers(shopId: string, limit: number = 10): Promise<any[]> {
    const { data: topCustomers, error } = await this.supabase
      .from('bookings')
      .select(`
        customer_id,
        customers!inner(full_name, email, phone),
        count,
        sum:total_amount
      `)
      .eq('shop_id', shopId)
      // .group('customer_id, customers.full_name, customers.email, customers.phone') // No soportado
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Error al obtener clientes top: ${error.message}`)
    return topCustomers || []
  }

  // 📊 Obtener clientes por valor
  async getCustomersByValue(shopId: string, limit: number = 10): Promise<any[]> {
    const { data: customersByValue, error } = await this.supabase
      .from('bookings')
      .select(`
        customer_id,
        customers!inner(full_name, email, phone),
        sum:total_amount
      `)
      .eq('shop_id', shopId)
      // .group('customer_id, customers.full_name, customers.email, customers.phone') // No soportado
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Error al obtener clientes por valor: ${error.message}`)
    return customersByValue || []
  }

  // 📅 Obtener clientes nuevos en un período
  async getNewCustomers(shopId: string, startDate: string, endDate: string): Promise<Customer[]> {
    const { data: newCustomers, error } = await this.supabase
      .from('customers')
      .select(`
        *,
        bookings!inner(shop_id, created_at)
      `)
      .eq('bookings.shop_id', shopId)
      .gte('bookings.created_at', startDate)
      .lte('bookings.created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener clientes nuevos: ${error.message}`)
    return newCustomers || []
  }

  // 🔄 Fusionar clientes duplicados
  async mergeCustomers(primaryCustomerId: string, secondaryCustomerId: string): Promise<void> {
    // Actualizar todas las reservas del cliente secundario al primario
    const { error: updateError } = await this.supabase
      .from('bookings')
      .update({ customer_id: primaryCustomerId })
      .eq('customer_id', secondaryCustomerId)

    if (updateError) throw new Error(`Error al fusionar reservas: ${updateError.message}`)

    // Eliminar el cliente secundario
    await this.deleteCustomer(secondaryCustomerId)
  }

  // 📋 Validar datos de cliente
  async validateCustomerData(customerData: Omit<CustomerInsert, 'id'>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Validar nombre
    if (!customerData.full_name || customerData.full_name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    }

    // Validar email si se proporciona
    if (customerData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerData.email)) {
        errors.push('El formato del email no es válido')
      }
    }

    // Validar teléfono si se proporciona
    if (customerData.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(customerData.phone.replace(/\s/g, ''))) {
        errors.push('El formato del teléfono no es válido')
      }
    }

    // Al menos email o teléfono debe estar presente
    if (!customerData.email && !customerData.phone) {
      errors.push('Debe proporcionar al menos un email o teléfono')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 📊 Obtener clientes inactivos
  async getInactiveCustomers(shopId: string, daysInactive: number = 90): Promise<Customer[]> {
    const inactiveDate = new Date()
    inactiveDate.setDate(inactiveDate.getDate() - daysInactive)

    const { data: inactiveCustomers, error } = await this.supabase
      .from('customers')
      .select(`
        *,
        bookings!inner(shop_id, created_at)
      `)
      .eq('bookings.shop_id', shopId)
      .lt('bookings.created_at', inactiveDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener clientes inactivos: ${error.message}`)
    return inactiveCustomers || []
  }
}

