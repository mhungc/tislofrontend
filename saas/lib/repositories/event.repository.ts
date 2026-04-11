import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type PrismaExecutor = Prisma.TransactionClient | typeof prisma

export interface CreateEventInput {
  store_id: string
  name: string
  description?: string | null
  date: string
  start_time: string
  end_time: string
  capacity: number
  price?: number | null
}

export interface UpdateEventInput {
  name?: string
  description?: string | null
  date?: string
  start_time?: string
  end_time?: string
  capacity?: number
  price?: number | null
}

export interface CreateEventBookingInput {
  event_id: string
  customer_name: string
  customer_email: string
  spots_reserved: number
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export class EventRepository {
  async getEventsByStoreAndDate(storeId: string, date: string, db: PrismaExecutor = prisma) {
    return db.events.findMany({
      where: {
        store_id: storeId,
        date: parseDateOnly(date)
      },
      orderBy: [{ start_time: 'asc' }],
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })
  }

  async getEventsByStore(storeId: string, db: PrismaExecutor = prisma) {
    return db.events.findMany({
      where: { store_id: storeId },
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }],
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })
  }

  async getEventById(eventId: string, db: PrismaExecutor = prisma) {
    return db.events.findUnique({
      where: { id: eventId },
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })
  }

  async createEvent(data: CreateEventInput, db: PrismaExecutor = prisma) {
    return db.events.create({
      data: {
        store_id: data.store_id,
        name: data.name,
        description: data.description,
        date: parseDateOnly(data.date),
        start_time: data.start_time,
        end_time: data.end_time,
        capacity: data.capacity,
        price: data.price ?? null
      },
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })
  }

  async updateEvent(eventId: string, data: UpdateEventInput, db: PrismaExecutor = prisma) {
    return db.events.update({
      where: { id: eventId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.date !== undefined ? { date: parseDateOnly(data.date) } : {}),
        ...(data.start_time !== undefined ? { start_time: data.start_time } : {}),
        ...(data.end_time !== undefined ? { end_time: data.end_time } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.price !== undefined ? { price: data.price } : {})
      },
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })
  }

  async deleteEvent(eventId: string, db: PrismaExecutor = prisma) {
    return db.events.delete({
      where: { id: eventId }
    })
  }

  async getTotalReservedSpots(eventId: string, db: PrismaExecutor = prisma) {
    const aggregate = await db.event_bookings.aggregate({
      where: { event_id: eventId },
      _sum: { spots_reserved: true }
    })

    return aggregate._sum.spots_reserved || 0
  }

  async createEventBooking(data: CreateEventBookingInput, db: PrismaExecutor = prisma) {
    return db.event_bookings.create({
      data: {
        event_id: data.event_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        spots_reserved: data.spots_reserved
      }
    })
  }

  async getEventBookings(eventId: string, db: PrismaExecutor = prisma) {
    return db.event_bookings.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'desc' }
    })
  }
}