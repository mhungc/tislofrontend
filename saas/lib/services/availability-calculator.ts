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
    console.log('=== CALCULATE AVAILABLE SLOTS ===')
    console.log('Date:', date)
    console.log('Schedules count:', schedules.length)
    console.log('Existing bookings:', existingBookings.length)
    console.log('Service duration:', serviceDurationMinutes, 'minutes')
    
    // Crear fecha sin problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const dayOfWeek = dateObj.getDay()
    console.log('Day of week:', dayOfWeek, ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek])
    
    const daySchedules = this.getDaySchedules(dayOfWeek, schedules)
    console.log('Day schedules found:', daySchedules.length)
    
    if (daySchedules.length === 0) {
      console.log('❌ No schedules for this day')
      console.log('=================================')
      return []
    }

    const allSlots = this.generateTimeSlots(daySchedules)
    console.log('Total slots generated:', allSlots.length)
    
    const availableSlots = this.filterAvailableSlots(allSlots, existingBookings, serviceDurationMinutes)
    const availableCount = availableSlots.filter(s => s.available).length
    console.log('Available slots:', availableCount, '/', allSlots.length)
    console.log('=================================')
    
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

    console.log('--- Generate Time Slots ---')
    for (const schedule of schedules) {
      console.log('Schedule:', {
        day: schedule.day_of_week,
        open: schedule.open_time,
        close: schedule.close_time,
        open_type: typeof schedule.open_time,
        close_type: typeof schedule.close_time
      })
      
      const openTime = this.parseTime(schedule.open_time)
      let closeTime = this.parseTime(schedule.close_time)
      
      // Si el cierre es antes o igual a la apertura, asumimos que es al día siguiente (ej: 22:00-00:00)
      if (closeTime <= openTime) {
        closeTime = new Date(closeTime)
        closeTime.setDate(closeTime.getDate() + 1)
      }
      
      console.log('Parsed:', {
        open: this.formatTime(openTime),
        close: this.formatTime(closeTime)
      })
      
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

    console.log('Slots generated:', slots.length)
    if (slots.length > 0) {
      console.log('First slot:', slots[0].time, 'Last slot:', slots[slots.length - 1].time)
    }
    console.log('---------------------------')

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
    if (startIndex === -1) {
      console.log(`⚠️ Slot ${startTime} not found in allSlots`)
      return false
    }

    // Verificar que hay suficientes slots consecutivos EN TIEMPO REAL
    const endTime = this.addMinutesToTime(startTime, serviceDurationMinutes)
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startIndex + i
      
      // Verificar que el slot existe
      if (slotIndex >= allSlots.length) {
        console.log(`⚠️ ${startTime}: Not enough slots in array (need ${slotsNeeded}, missing ${i})`)
        return false
      }
      
      const currentSlot = allSlots[slotIndex]
      const currentSlotTime = currentSlot.time
      
      // Verificar que los slots son consecutivos en tiempo (no hay gaps)
      if (i > 0) {
        const expectedTime = this.addMinutesToTime(allSlots[startIndex + i - 1].time, this.SLOT_DURATION_MINUTES)
        if (currentSlotTime !== expectedTime) {
          console.log(`⚠️ ${startTime}: Gap detected between slots (${allSlots[startIndex + i - 1].time} → ${currentSlotTime}, expected ${expectedTime})`)
          return false
        }
      }
      
      // Verificar que no hay conflicto con reservas existentes
      if (this.hasBookingConflict(currentSlotTime, existingBookings)) {
        console.log(`⚠️ ${startTime}: Conflict at ${currentSlotTime}`)
        return false
      }
    }

    // Verificar que el tiempo de fin del servicio no excede el último slot que necesitamos
    const lastNeededSlot = allSlots[startIndex + slotsNeeded - 1]
    const lastNeededSlotEnd = this.addMinutesToTime(lastNeededSlot.time, this.SLOT_DURATION_MINUTES)
    
    // Comparar como minutos desde medianoche para manejar el cruce de medianoche
    const fits = this.timeToMinutes(endTime) <= this.timeToMinutes(lastNeededSlotEnd)
    if (!fits) {
      console.log(`⚠️ ${startTime}: Service ends at ${endTime} but last needed slot ends at ${lastNeededSlotEnd}`)
    }
    
    return fits
  }

  /**
   * Convierte tiempo HH:MM a minutos desde medianoche
   * Maneja el cruce de medianoche (00:00-05:59 se considera como 1440+ minutos)
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    
    // Si es entre 00:00 y 05:59, asumimos que es después de medianoche
    if (hours >= 0 && hours < 6) {
      return totalMinutes + 1440 // +24 horas
    }
    
    return totalMinutes
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
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
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