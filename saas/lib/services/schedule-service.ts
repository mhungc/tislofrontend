// 🕐 Servicio para Gestión de Horarios y Disponibilidad
import { createClient } from '@/lib/supabase/client'
import type { 
  ShopSchedule, 
  ShopScheduleInsert, 
  ShopScheduleUpdate,
  ScheduleException,
  ScheduleExceptionInsert,
  ScheduleExceptionUpdate,
  Booking
} from '@/lib/types/database'

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  bookingId?: string
}

export interface DayAvailability {
  date: string
  dayOfWeek: number
  isWorkingDay: boolean
  openTime?: string
  closeTime?: string
  timeSlots: TimeSlot[]
  exception?: ScheduleException
}

export class ScheduleService {
  private supabase = createClient()

  // 📅 Obtener horarios semanales de una tienda
  async getShopSchedules(shopId: string): Promise<ShopSchedule[]> {
    const { data: schedules, error } = await this.supabase
      .from('shop_schedules')
      .select('*')
      .eq('shop_id', shopId)
      .order('day_of_week')

    if (error) throw new Error(`Error al obtener horarios: ${error.message}`)
    return schedules || []
  }

  // 📅 Obtener un horario específico
  async getShopSchedule(shopId: string, dayOfWeek: number): Promise<ShopSchedule | null> {
    const { data: schedule, error } = await this.supabase
      .from('shop_schedules')
      .select('*')
      .eq('shop_id', shopId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (error) throw new Error(`Error al obtener horario: ${error.message}`)
    return schedule
  }

  // ➕ Crear/actualizar horario semanal
  async upsertShopSchedule(scheduleData: ShopScheduleInsert): Promise<ShopSchedule> {
    const { data: schedule, error } = await this.supabase
      .from('shop_schedules')
      .upsert(scheduleData, { onConflict: 'shop_id,day_of_week' })
      .select()
      .single()

    if (error) throw new Error(`Error al guardar horario: ${error.message}`)
    return schedule
  }

  // ✏️ Actualizar horario
  async updateShopSchedule(scheduleId: string, scheduleData: ShopScheduleUpdate): Promise<ShopSchedule> {
    const { data: schedule, error } = await this.supabase
      .from('shop_schedules')
      .update(scheduleData)
      .eq('id', scheduleId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar horario: ${error.message}`)
    return schedule
  }

  // 🗑️ Eliminar horario
  async deleteShopSchedule(scheduleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('shop_schedules')
      .delete()
      .eq('id', scheduleId)

    if (error) throw new Error(`Error al eliminar horario: ${error.message}`)
  }

  // 📅 Obtener excepciones de horario
  async getScheduleExceptions(shopId: string, startDate?: string, endDate?: string): Promise<ScheduleException[]> {
    let query = this.supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('shop_id', shopId)
      .order('exception_date')

    if (startDate) {
      query = query.gte('exception_date', startDate)
    }
    if (endDate) {
      query = query.lte('exception_date', endDate)
    }

    const { data: exceptions, error } = await query

    if (error) throw new Error(`Error al obtener excepciones: ${error.message}`)
    return exceptions || []
  }

  // ➕ Crear excepción de horario
  async createScheduleException(exceptionData: ScheduleExceptionInsert): Promise<ScheduleException> {
    const { data: exception, error } = await this.supabase
      .from('schedule_exceptions')
      .insert(exceptionData)
      .select()
      .single()

    if (error) throw new Error(`Error al crear excepción: ${error.message}`)
    return exception
  }

  // ✏️ Actualizar excepción
  async updateScheduleException(exceptionId: string, exceptionData: ScheduleExceptionUpdate): Promise<ScheduleException> {
    const { data: exception, error } = await this.supabase
      .from('schedule_exceptions')
      .update(exceptionData)
      .eq('id', exceptionId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar excepción: ${error.message}`)
    return exception
  }

  // 🗑️ Eliminar excepción
  async deleteScheduleException(exceptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('schedule_exceptions')
      .delete()
      .eq('id', exceptionId)

    if (error) throw new Error(`Error al eliminar excepción: ${error.message}`)
  }

  // 🎯 Calcular disponibilidad para un rango de fechas
  async calculateAvailability(
    shopId: string, 
    startDate: string, 
    endDate: string, 
    serviceDurationMinutes: number = 60
  ): Promise<DayAvailability[]> {
    // Obtener horarios semanales
    const schedules = await this.getShopSchedules(shopId)
    
    // Obtener excepciones en el rango
    const exceptions = await this.getScheduleExceptions(shopId, startDate, endDate)
    
    // Obtener reservas existentes en el rango
    const { data: bookings, error: bookingsError } = await this.supabase
      .from('bookings')
      .select('booking_date, start_time, end_time, id')
      .eq('shop_id', shopId)
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .in('status', ['pending', 'confirmed'])

    if (bookingsError) throw new Error(`Error al obtener reservas: ${bookingsError.message}`)

    const availability: DayAvailability[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      // Buscar horario para este día
      const schedule = schedules.find(s => s.day_of_week === dayOfWeek)
      
      // Buscar excepción para esta fecha
      const exception = exceptions.find(e => e.exception_date === dateStr)
      
      // Reservas para esta fecha
      const dayBookings = bookings?.filter(b => b.booking_date === dateStr) || []

      const dayAvailability: DayAvailability = {
        date: dateStr,
        dayOfWeek,
        isWorkingDay: exception?.is_closed ? false : (schedule?.is_working_day ?? false),
        openTime: exception?.open_time || schedule?.open_time,
        closeTime: exception?.close_time || schedule?.close_time,
        timeSlots: [],
        exception: exception || undefined
      }

      // Generar slots de tiempo si es día laborable
      if (dayAvailability.isWorkingDay && dayAvailability.openTime && dayAvailability.closeTime) {
        dayAvailability.timeSlots = this.generateTimeSlots(
          dayAvailability.openTime,
          dayAvailability.closeTime,
          serviceDurationMinutes,
          dayBookings
        )
      }

      availability.push(dayAvailability)
    }

    return availability
  }

  // 🕐 Generar slots de tiempo
  private generateTimeSlots(
    openTime: string, 
    closeTime: string, 
    durationMinutes: number, 
    bookings: Booking[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = []
    const open = new Date(`2000-01-01T${openTime}`)
    const close = new Date(`2000-01-01T${closeTime}`)
    const duration = durationMinutes * 60 * 1000 // en milisegundos

    for (let time = new Date(open); time < close; time.setTime(time.getTime() + duration)) {
      const slotStart = time.toTimeString().slice(0, 5)
      const slotEnd = new Date(time.getTime() + duration).toTimeString().slice(0, 5)

      // Verificar si hay reserva en este slot
      const conflictingBooking = bookings.find(booking => {
        const bookingStart = booking.start_time
        const bookingEnd = booking.end_time
        return (slotStart >= bookingStart && slotStart < bookingEnd) ||
               (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
               (slotStart <= bookingStart && slotEnd >= bookingEnd)
      })

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !conflictingBooking,
        bookingId: conflictingBooking?.id
      })
    }

    return slots
  }

  // 🔄 Configurar horario semanal completo
  async setWeeklySchedule(shopId: string, schedules: Omit<ShopScheduleInsert, 'shop_id'>[]): Promise<ShopSchedule[]> {
    // Eliminar horarios existentes
    await this.supabase
      .from('shop_schedules')
      .delete()
      .eq('shop_id', shopId)

    // Insertar nuevos horarios
    const schedulesWithShopId = schedules.map(schedule => ({
      ...schedule,
      shop_id: shopId
    }))

    const { data: newSchedules, error } = await this.supabase
      .from('shop_schedules')
      .insert(schedulesWithShopId)
      .select()

    if (error) throw new Error(`Error al configurar horario semanal: ${error.message}`)
    return newSchedules || []
  }

  // 📊 Obtener estadísticas de disponibilidad
  async getAvailabilityStats(shopId: string, startDate: string, endDate: string) {
    const availability = await this.calculateAvailability(shopId, startDate, endDate)
    
    const stats = {
      totalDays: availability.length,
      workingDays: availability.filter(day => day.isWorkingDay).length,
      totalSlots: availability.reduce((sum, day) => sum + day.timeSlots.length, 0),
      availableSlots: availability.reduce((sum, day) => 
        sum + day.timeSlots.filter(slot => slot.available).length, 0
      ),
      bookedSlots: availability.reduce((sum, day) => 
        sum + day.timeSlots.filter(slot => !slot.available).length, 0
      )
    }

    return {
      ...stats,
      utilizationRate: stats.totalSlots > 0 ? (stats.bookedSlots / stats.totalSlots) * 100 : 0
    }
  }
}

