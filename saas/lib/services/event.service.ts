import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  CreateEventBookingInput,
  CreateEventInput,
  EventRepository,
  UpdateEventInput
} from '@/lib/repositories/event.repository'
import { BookingEmailService } from '@/lib/services/booking-email-service'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'

interface EventCustomerData {
  customer_name: string
  customer_email: string
}

interface EventAvailability {
  capacity: number
  reserved: number
  available: number
}

function normalizeDateOnly(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return new Date(value).toISOString().split('T')[0]
}

function serializePrice(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return null
  }

  return typeof value === 'number' ? value : Number(value)
}

export class EventService {
  private eventRepo = new EventRepository()
  private bookingEmailService = new BookingEmailService()
  private scheduleRepo = new ScheduleRepository()

  private parseDateWeekday(date: string): number {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay()
  }

  private toHHMM(value: Date | string): string {
    if (value instanceof Date) {
      return `${value.getUTCHours().toString().padStart(2, '0')}:${value.getUTCMinutes().toString().padStart(2, '0')}`
    }

    const str = String(value)
    if (str.includes('T')) {
      return str.split('T')[1]?.slice(0, 5) || str.slice(0, 5)
    }

    return str.slice(0, 5)
  }

  private async validateWithinShopSchedule(storeId: string, date: string, startTime: string, endTime: string) {
    const dayOfWeek = this.parseDateWeekday(date)
    const schedules = await this.scheduleRepo.getByShopAndDay(storeId, dayOfWeek)
    const workingBlocks = schedules
      .filter((schedule) => schedule.is_working_day !== false)
      .map((schedule) => ({
        open: this.toHHMM(schedule.open_time as unknown as Date | string),
        close: this.toHHMM(schedule.close_time as unknown as Date | string)
      }))

    if (workingBlocks.length === 0) {
      throw new Error('La tienda no tiene horario configurado para ese día')
    }

    const insideAnyBlock = workingBlocks.some((block) => startTime >= block.open && endTime <= block.close)
    if (!insideAnyBlock) {
      throw new Error('El evento debe estar dentro del horario configurado para ese día')
    }
  }

  private validatePayload(data: Partial<CreateEventInput | UpdateEventInput>) {
    if (data.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('La fecha debe usar formato YYYY-MM-DD')
    }

    if (data.start_time !== undefined && !/^\d{2}:\d{2}$/.test(data.start_time)) {
      throw new Error('La hora de inicio debe usar formato HH:mm')
    }

    if (data.end_time !== undefined && !/^\d{2}:\d{2}$/.test(data.end_time)) {
      throw new Error('La hora de fin debe usar formato HH:mm')
    }

    const startTime = data.start_time
    const endTime = data.end_time
    if (startTime && endTime && startTime >= endTime) {
      throw new Error('La hora de fin debe ser mayor a la hora de inicio')
    }

    if (data.capacity !== undefined && data.capacity <= 0) {
      throw new Error('La capacidad debe ser mayor que cero')
    }
  }

  private serializeEvent(event: any, availability?: EventAvailability) {
    return {
      id: event.id,
      store_id: event.store_id,
      name: event.name,
      description: event.description,
      date: normalizeDateOnly(event.date),
      start_time: event.start_time,
      end_time: event.end_time,
      capacity: event.capacity,
      price: serializePrice(event.price),
      created_at: event.created_at,
      store: event.shops
        ? {
            id: event.shops.id,
            name: event.shops.name,
            address: event.shops.address,
            phone: event.shops.phone,
            email: event.shops.email
          }
        : undefined,
      ...(availability ? { availability } : {})
    }
  }

  async createEvent(storeId: string, data: Omit<CreateEventInput, 'store_id'>) {
    this.validatePayload(data)
    await this.validateWithinShopSchedule(storeId, data.date, data.start_time, data.end_time)

    const event = await this.eventRepo.createEvent({
      store_id: storeId,
      ...data
    })

    return this.serializeEvent(event, {
      capacity: event.capacity,
      reserved: 0,
      available: event.capacity
    })
  }

  async updateEvent(eventId: string, data: UpdateEventInput) {
    const existingEvent = await this.eventRepo.getEventById(eventId)
    if (!existingEvent) {
      throw new Error('Evento no encontrado')
    }

    this.validatePayload({
      date: data.date ?? normalizeDateOnly(existingEvent.date),
      start_time: data.start_time ?? existingEvent.start_time,
      end_time: data.end_time ?? existingEvent.end_time,
      capacity: data.capacity ?? existingEvent.capacity
    })

    const mergedDate = data.date ?? normalizeDateOnly(existingEvent.date)
    const mergedStartTime = data.start_time ?? existingEvent.start_time
    const mergedEndTime = data.end_time ?? existingEvent.end_time
    await this.validateWithinShopSchedule(existingEvent.store_id, mergedDate, mergedStartTime, mergedEndTime)

    const updatedEvent = await this.eventRepo.updateEvent(eventId, data)
    const availability = await this.getEventAvailability(eventId)
    return this.serializeEvent(updatedEvent, availability)
  }

  async deleteEvent(eventId: string) {
    const existingEvent = await this.eventRepo.getEventById(eventId)
    if (!existingEvent) {
      throw new Error('Evento no encontrado')
    }

    await this.eventRepo.deleteEvent(eventId)
    return { success: true }
  }

  async getEventsByStore(storeId: string) {
    const events = await this.eventRepo.getEventsByStore(storeId)

    return Promise.all(
      events.map(async (event) => {
        const availability = await this.getEventAvailability(event.id)
        return this.serializeEvent(event, availability)
      })
    )
  }

  async getEventsByStoreAndDate(storeId: string, date: string) {
    const events = await this.eventRepo.getEventsByStoreAndDate(storeId, date)

    return Promise.all(
      events.map(async (event) => {
        const availability = await this.getEventAvailability(event.id)
        return this.serializeEvent(event, availability)
      })
    )
  }

  async isTimeRangeBlockedByEvent(storeId: string, date: string, startTime: string, endTime: string) {
    const events = await this.eventRepo.getEventsByStoreAndDate(storeId, date)

    return events.some((event) => startTime < event.end_time && endTime > event.start_time)
  }

  async getEventAvailability(eventId: string) {
    const event = await this.eventRepo.getEventById(eventId)
    if (!event) {
      throw new Error('Evento no encontrado')
    }

    const reserved = await this.eventRepo.getTotalReservedSpots(eventId)
    return {
      capacity: event.capacity,
      reserved,
      available: Math.max(event.capacity - reserved, 0)
    }
  }

  async getEventDetails(eventId: string) {
    const event = await this.eventRepo.getEventById(eventId)
    if (!event) {
      throw new Error('Evento no encontrado')
    }

    const availability = await this.getEventAvailability(eventId)
    const bookings = await this.eventRepo.getEventBookings(eventId)

    return {
      ...this.serializeEvent(event, availability),
      bookings: bookings.map((booking) => ({
        ...booking,
        created_at: booking.created_at
      }))
    }
  }

  async bookEvent(eventId: string, spots: number, customerData: EventCustomerData) {
    if (!customerData.customer_name || !customerData.customer_email || !spots) {
      throw new Error('Datos incompletos para la reserva del evento')
    }

    if (spots <= 0) {
      throw new Error('La cantidad de plazas debe ser mayor que cero')
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM public.events
        WHERE id = ${eventId}::uuid
        FOR UPDATE
      `

      const event = await this.eventRepo.getEventById(eventId, tx)
      if (!event) {
        throw new Error('Evento no encontrado')
      }

      const reserved = await this.eventRepo.getTotalReservedSpots(eventId, tx)
      if (reserved + spots > event.capacity) {
        throw new Error('No hay suficientes plazas disponibles')
      }

      const bookingInput: CreateEventBookingInput = {
        event_id: eventId,
        customer_name: customerData.customer_name,
        customer_email: customerData.customer_email,
        spots_reserved: spots
      }

      const booking = await this.eventRepo.createEventBooking(bookingInput, tx)

      return {
        event,
        booking,
        availability: {
          capacity: event.capacity,
          reserved: reserved + spots,
          available: event.capacity - (reserved + spots)
        }
      }
    })

    await this.bookingEmailService.sendEventBookingConfirmationEmail({
      customerName: customerData.customer_name,
      customerEmail: customerData.customer_email,
      eventName: result.event.name,
      eventDate: normalizeDateOnly(result.event.date),
      startTime: result.event.start_time,
      endTime: result.event.end_time,
      spotsReserved: spots,
      shopName: result.event.shops?.name || 'ReservaFácil'
    })

    return {
      success: true,
      booking: result.booking,
      availability: result.availability
    }
  }
}