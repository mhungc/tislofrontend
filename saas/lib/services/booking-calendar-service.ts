export interface CalendarBooking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  booking_date: string
  start_time: string
  end_time: string
  total_duration: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  services: {
    name: string
    duration_minutes: number
    price: number
  }[]
  notes?: string
}

export interface CalendarSlot {
  time: string
  booking?: CalendarBooking
  available: boolean
}

export interface CalendarDay {
  date: string
  dayOfWeek: number
  isWorkingDay: boolean
  slots: CalendarSlot[]
}

export class BookingCalendarService {
  
  async getCalendarView(shopId: string, startDate: string, endDate: string) {
    const response = await fetch(`/api/shops/${shopId}/calendar?start=${startDate}&end=${endDate}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al cargar calendario')
    }

    return await response.json()
  }

  async getBookings(shopId: string, startDate: string, endDate: string) {
    try {
      const response = await fetch(`/api/shops/${shopId}/bookings?start=${startDate}&end=${endDate}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error de conexión' }))
        throw new Error(error.error || 'Error al cargar reservas')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Error de conexión con el servidor')
      }
      throw error
    }
  }

  async updateBookingStatus(shopId: string, bookingId: string, status: 'confirmed' | 'cancelled') {
    const response = await fetch(`/api/shops/${shopId}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar reserva')
    }

    return await response.json()
  }

  async getBookingDetails(shopId: string, bookingId: string) {
    const response = await fetch(`/api/shops/${shopId}/bookings/${bookingId}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener detalles')
    }

    return await response.json()
  }

  /**
   * Genera estructura de calendario con slots de tiempo y reservas posicionadas
   */
  generateCalendarStructure(
    schedules: any[],
    bookings: CalendarBooking[],
    startDate: string,
    endDate: string
  ): CalendarDay[] {
    const days: CalendarDay[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = this.formatDate(date)
      const dayOfWeek = date.getDay()
      
      // Obtener horarios del día
      const daySchedules = schedules.filter(s => s.day_of_week === dayOfWeek && s.is_working_day)
      const dayBookings = bookings.filter(b => b.booking_date === dateStr)
      
      const slots = this.generateDaySlots(daySchedules, dayBookings)
      
      days.push({
        date: dateStr,
        dayOfWeek,
        isWorkingDay: daySchedules.length > 0,
        slots
      })
    }

    return days
  }

  private generateDaySlots(schedules: any[], bookings: CalendarBooking[]): CalendarSlot[] {
    if (schedules.length === 0) return []

    const slots: CalendarSlot[] = []
    const SLOT_DURATION = 30 // minutos
    const allTimes = new Set<string>()

    // Generar todos los slots posibles de todos los bloques horarios
    for (const schedule of schedules) {
      const openTime = this.parseTime(schedule.open_time)
      const closeTime = this.parseTime(schedule.close_time)
      
      let currentTime = new Date(openTime)
      
      while (currentTime < closeTime) {
        const timeStr = this.formatTime(currentTime)
        allTimes.add(timeStr)
        currentTime.setMinutes(currentTime.getMinutes() + SLOT_DURATION)
      }
    }

    // Crear slots con información de reservas
    Array.from(allTimes).sort().forEach(timeStr => {
      const booking = bookings.find(b => 
        timeStr >= b.start_time && timeStr < b.end_time
      )
      
      slots.push({
        time: timeStr,
        booking,
        available: !booking
      })
    })

    return slots
  }

  private parseTime(time: Date | string): Date {
    if (time instanceof Date) {
      return time
    }
    
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      return date
    }
    
    return new Date(time)
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}