export interface TimeSlot {
  time: string
  available: boolean
}

export interface Schedule {
  day_of_week: number
  open_time: Date | string
  close_time: Date | string
  is_working_day: boolean
  block_order: number
}

export interface Booking {
  start_time: string
  end_time: string
}

export class AvailabilityCalculator {
  private readonly SLOT_DURATION_MINUTES = 30

  /**
   * Calcula los slots disponibles para una fecha específica
   */
  calculateAvailableSlots(
    date: string,
    schedules: Schedule[],
    existingBookings: Booking[],
    serviceDurationMinutes: number = 60
  ): TimeSlot[] {
    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const dayOfWeek = dateObj.getDay()
    const daySchedules = this.getDaySchedules(dayOfWeek, schedules)
    
    if (daySchedules.length === 0) {
      return []
    }

    const allSlots = this.generateTimeSlots(daySchedules)
    const availableSlots = this.filterAvailableSlots(allSlots, existingBookings, serviceDurationMinutes)
    
    return availableSlots
  }

  /**
   * Obtiene los horarios configurados para un día específico
   */
  private getDaySchedules(dayOfWeek: number, schedules: Schedule[]): Schedule[] {
    return schedules
      .filter(s => s.day_of_week === dayOfWeek && s.is_working_day)
      .sort((a, b) => a.block_order - b.block_order)
  }

  /**
   * Genera todos los slots de tiempo posibles basado en los horarios
   */
  private generateTimeSlots(schedules: Schedule[]): TimeSlot[] {
    const slots: TimeSlot[] = []

    for (const schedule of schedules) {
      const openTime = this.parseTime(schedule.open_time)
      const closeTime = this.parseTime(schedule.close_time)
      
      let currentTime = new Date(openTime)
      
      while (currentTime < closeTime) {
        const timeStr = this.formatTime(currentTime)
        
        // Evitar duplicados si hay bloques superpuestos
        if (!slots.some(slot => slot.time === timeStr)) {
          slots.push({
            time: timeStr,
            available: true
          })
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + this.SLOT_DURATION_MINUTES)
      }
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time))
  }

  /**
   * Filtra slots disponibles considerando reservas existentes y duración del servicio
   */
  private filterAvailableSlots(
    slots: TimeSlot[],
    existingBookings: Booking[],
    serviceDurationMinutes: number
  ): TimeSlot[] {
    return slots.map(slot => ({
      ...slot,
      available: this.isSlotAvailable(slot.time, slots, existingBookings, serviceDurationMinutes)
    }))
  }

  /**
   * Verifica si un slot específico está disponible para un servicio
   */
  private isSlotAvailable(
    startTime: string,
    allSlots: TimeSlot[],
    existingBookings: Booking[],
    serviceDurationMinutes: number
  ): boolean {
    // Calcular cuántos slots consecutivos necesitamos
    const slotsNeeded = Math.ceil(serviceDurationMinutes / this.SLOT_DURATION_MINUTES)
    
    // Encontrar el índice del slot actual
    const startIndex = allSlots.findIndex(slot => slot.time === startTime)
    if (startIndex === -1) return false

    // Verificar que hay suficientes slots consecutivos disponibles
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startIndex + i
      
      // Verificar que el slot existe
      if (slotIndex >= allSlots.length) return false
      
      const currentSlotTime = allSlots[slotIndex].time
      
      // Verificar que no hay conflicto con reservas existentes
      if (this.hasBookingConflict(currentSlotTime, existingBookings)) {
        return false
      }
    }

    // Verificar que el servicio completo cabe en el horario de trabajo
    const endTime = this.addMinutesToTime(startTime, serviceDurationMinutes)
    const lastSlotTime = allSlots[allSlots.length - 1].time
    const lastSlotEndTime = this.addMinutesToTime(lastSlotTime, this.SLOT_DURATION_MINUTES)
    
    return endTime <= lastSlotEndTime
  }

  /**
   * Verifica si hay conflicto con reservas existentes
   */
  private hasBookingConflict(slotTime: string, existingBookings: Booking[]): boolean {
    return existingBookings.some(booking => {
      return slotTime >= booking.start_time && slotTime < booking.end_time
    })
  }

  /**
   * Convierte Date o string a objeto Date para cálculos
   */
  private parseTime(time: Date | string): Date {
    if (time instanceof Date) {
      return time
    }
    
    // Si es string en formato HH:MM
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes, 0, 0)
      return date
    }
    
    // Si es string de fecha completa
    return new Date(time)
  }

  /**
   * Formatea tiempo a string HH:MM
   */
  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  /**
   * Suma minutos a un tiempo en formato HH:MM
   */
  private addMinutesToTime(timeStr: string, minutes: number): string {
    const [hours, mins] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, mins, 0, 0)
    date.setMinutes(date.getMinutes() + minutes)
    return this.formatTime(date)
  }
}