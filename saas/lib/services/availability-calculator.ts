import { toZonedTime, fromZonedTime } from 'date-fns-tz'
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
  private readonly baseSlotMinutes: number
  private readonly bufferMinutes: number

  constructor(baseSlotMinutes: number = 15, bufferMinutes: number = 0) {
    this.baseSlotMinutes = baseSlotMinutes
    this.bufferMinutes = bufferMinutes
  }

  /**
   * Calcula los slots disponibles para una fecha específica
   */
  /**
   * Devuelve slots y fillableGaps (huecos rellenables) en formato:
   * { slots: TimeSlot[], fillableGaps: { startTime, endTime, durationMinutes }[] }
   */
  calculateAvailableSlots(
    date: string,
    schedules: Schedule[],
    existingBookings: Booking[],
    serviceDurationMinutes?: number,
    timezone: string = 'UTC'
  ): { slots: TimeSlot[]; fillableGaps: { startTime: string; endTime: string; durationMinutes: number }[] } {
    // timezone: string = 'UTC'  // <-- removed invalid field declaration
    console.log('=== CALCULATE AVAILABLE SLOTS ===')
    console.log('Date:', date)
    console.log('Timezone:', timezone)
    console.log('Schedules count:', schedules.length)
    console.log('Existing bookings:', existingBookings.length)
    console.log('Service duration:', serviceDurationMinutes, 'minutes')
    
    // Crear fecha en la zona horaria de la tienda para obtener el día de la semana correcto
    const [year, month, day] = date.split('-').map(Number)
    // Creamos la fecha en UTC primero, luego la convertimos a la zona horaria de la tienda
    const utcDate = new Date(Date.UTC(year, month - 1, day))
    const zonedDate = toZonedTime(utcDate, timezone)
    const dayOfWeek = zonedDate.getDay()
    console.log('Day of week (zoned):', dayOfWeek, ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek])

    const daySchedules = this.getDaySchedules(dayOfWeek, schedules)
    console.log('Day schedules found:', daySchedules.length)

    if (daySchedules.length === 0) {
      console.log('❌ No schedules for this day')
      console.log('=================================')
      return { slots: [], fillableGaps: [] }
    }

    const allSlots = this.generateTimeSlots(daySchedules)
    console.log('Total slots generated:', allSlots.length)
    
    // Filtrar slots pasados SOLO si la fecha es hoy en la zona horaria de la tienda
    // Obtener la fecha actual en la zona horaria de la tienda
    const nowZoned = toZonedTime(new Date(), timezone)
    const todayStr = nowZoned.getFullYear() + '-' + String(nowZoned.getMonth() + 1).padStart(2, '0') + '-' + String(nowZoned.getDate()).padStart(2, '0')
    const isToday = date === todayStr
    console.log('nowZoned:', nowZoned.toISOString(), '| todayStr:', todayStr, '| isToday:', isToday)
    const availableSlots = this.filterAvailableSlots(allSlots, existingBookings, serviceDurationMinutes ?? 60)
      .map(slot => {
        if (isToday) {
          const slotDateLocal = toZonedTime(`${date}T${slot.time}:00`, timezone)
          console.log(`[DEBUG] Slot:`, slot.time, '| slotDateLocal:', slotDateLocal.toISOString(), '| nowZoned:', nowZoned.toISOString(), '| available:', slotDateLocal >= nowZoned)
          if (slotDateLocal < nowZoned) {
            return { ...slot, available: false }
          }
        }
        return slot
      })
    const availableCount = availableSlots.filter(s => s.available).length
    console.log('Available slots:', availableCount, '/', allSlots.length)

    // TAREA 5: Calcular fillableGaps solo si se pasa serviceDurationMinutes
    let fillableGaps: { startTime: string; endTime: string; durationMinutes: number }[] = []
    if (serviceDurationMinutes) {
      fillableGaps = this.findFillableGaps(daySchedules, existingBookings, allSlots, serviceDurationMinutes)
    }

    console.log('=================================')
    return { slots: availableSlots, fillableGaps }
  }

  /**
   * Encuentra huecos rellenables (gaps) entre reservas donde cabe el servicio pero no hay slot generado
   */
  private findFillableGaps(
    daySchedules: Schedule[],
    existingBookings: Booking[],
    allSlots: TimeSlot[],
    serviceDurationMinutes: number
  ): { startTime: string; endTime: string; durationMinutes: number }[] {
    // 1. Ordenar reservas por start_time
    const sortedBookings = [...existingBookings].sort((a, b) => a.start_time.localeCompare(b.start_time))
    // 2. Construir lista de intervalos ocupados (start_time, end_time+buffer)
    const busyIntervals = sortedBookings.map(b => ({
      start: b.start_time,
      end: this.addMinutesToTime(b.end_time, this.bufferMinutes)
    }))
    // 3. Agregar extremos del día (inicio y fin de horarios)
    const scheduleStarts = daySchedules.map(s => this.formatTime(this.parseTime(s.open_time)))
    const scheduleEnds = daySchedules.map(s => this.formatTime(this.parseTime(s.close_time)))
    const dayStart = scheduleStarts.sort()[0]
    const dayEnd = scheduleEnds.sort().reverse()[0]
    // 4. Buscar huecos entre intervalos ocupados
    const gaps: { start: string; end: string }[] = []
    let prevEnd = dayStart
    for (const interval of busyIntervals) {
      if (this.timeToMinutes(interval.start) > this.timeToMinutes(prevEnd)) {
        gaps.push({ start: prevEnd, end: interval.start })
      }
      prevEnd = interval.end
    }
    // Último hueco hasta el cierre
    if (this.timeToMinutes(prevEnd) < this.timeToMinutes(dayEnd)) {
      gaps.push({ start: prevEnd, end: dayEnd })
    }
    // 5. Filtrar gaps donde cabe el servicio y NO hay slot generado en ese inicio
    const slotTimes = new Set(allSlots.map(s => s.time))
    return gaps
      .map(gap => {
        const duration = this.timeToMinutes(gap.end) - this.timeToMinutes(gap.start)
        return {
          startTime: gap.start,
          endTime: gap.end,
          durationMinutes: duration
        }
      })
      .filter(gap => gap.durationMinutes >= serviceDurationMinutes && !slotTimes.has(gap.startTime))
  }

  /**
   * Obtiene los horarios configurados para un día específico
   */
  private getDaySchedules(dayOfWeek: number, schedules: Schedule[]): Schedule[] {
    return schedules
      .filter(s => s.day_of_week === dayOfWeek && s.is_working_day !== false)
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
        
        currentTime.setMinutes(currentTime.getMinutes() + this.baseSlotMinutes)
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
    const blockedMinutes = Math.ceil(serviceDurationMinutes / this.baseSlotMinutes) * this.baseSlotMinutes
    const slotsNeeded = blockedMinutes / this.baseSlotMinutes
    
    const startIndex = allSlots.findIndex(slot => slot.time === startTime)
    if (startIndex === -1) {
      console.log(`⚠️ Slot ${startTime} not found in allSlots`)
      return false
    }

    const endTime = this.addMinutesToTime(startTime, serviceDurationMinutes)
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startIndex + i
      
      if (slotIndex >= allSlots.length) {
        console.log(`⚠️ ${startTime}: Not enough slots in array (need ${slotsNeeded}, missing ${i})`)
        return false
      }
      
      const currentSlot = allSlots[slotIndex]
      const currentSlotTime = currentSlot.time
      
      if (i > 0) {
        const expectedTime = this.addMinutesToTime(allSlots[startIndex + i - 1].time, this.baseSlotMinutes)
        if (currentSlotTime !== expectedTime) {
          console.log(`⚠️ ${startTime}: Gap detected between slots (${allSlots[startIndex + i - 1].time} → ${currentSlotTime}, expected ${expectedTime})`)
          return false
        }
      }
      
      if (this.hasBookingConflict(currentSlotTime, existingBookings)) {
        console.log(`⚠️ ${startTime}: Conflict at ${currentSlotTime}`)
        return false
      }
    }

    const lastNeededSlot = allSlots[startIndex + slotsNeeded - 1]
    const lastNeededSlotEnd = this.addMinutesToTime(lastNeededSlot.time, this.baseSlotMinutes)
    
    // TAREA 1: Permitir que el servicio termine exactamente a la hora de cierre (<= en vez de <)
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
      // Fin real de la reserva = end_time + buffer
      const bufferEnd = this.addMinutesToTime(booking.end_time, this.bufferMinutes)
      return slotTime >= booking.start_time && this.timeToMinutes(slotTime) < this.timeToMinutes(bufferEnd)
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