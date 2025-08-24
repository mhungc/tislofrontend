// Tipos de base de datos para el proyecto
export interface Shop {
  id: string
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Record<string, any> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  shop_id: string
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email?: string | null
  phone?: string | null
  full_name: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  shop_id: string
  customer_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ShopSchedule {
  id: string
  shop_id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_working_day: boolean
  block_order?: number | null
  created_at: string
  updated_at: string
}

export interface ScheduleException {
  id: string
  shop_id: string
  exception_date: string
  open_time?: string | null
  close_time?: string | null
  is_closed: boolean
  reason?: string | null
  created_at: string
  updated_at: string
}

export interface BookingService {
  id: string
  booking_id: string
  service_id: string
  price: number
  created_at: string
}

// Tipos para inserts
export type ShopInsert = Omit<Shop, 'id' | 'created_at' | 'updated_at'>
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>
export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>
export type ShopScheduleInsert = Omit<ShopSchedule, 'id' | 'created_at' | 'updated_at'>
export type ScheduleExceptionInsert = Omit<ScheduleException, 'id' | 'created_at' | 'updated_at'>
export type BookingServiceInsert = Omit<BookingService, 'id' | 'created_at'>

// Tipos para updates
export type ShopUpdate = Partial<Omit<Shop, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>
export type CustomerUpdate = Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'shop_id' | 'customer_id' | 'created_at' | 'updated_at'>>
export type ShopScheduleUpdate = Partial<Omit<ShopSchedule, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>
export type ScheduleExceptionUpdate = Partial<Omit<ScheduleException, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>