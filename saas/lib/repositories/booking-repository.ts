import { prisma } from '@/lib/prisma'
import { AvailabilityCalculator } from '@/lib/services/availability-calculator'

export interface BookingData {
  id?: string
  shop_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  booking_date: string
  start_time: string
  end_time: string
  total_duration: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
}

export interface BookingServiceData {
  service_id: string
  price: number
  duration_minutes: number
}

export interface BookingModifierData {
  service_modifier_id: string
  applied_duration: number
  applied_price: number
}

export class BookingRepository {
  
  async create(bookingData: BookingData, services: BookingServiceData[], modifiers: BookingModifierData[] = []) {
    return await prisma.$transaction(async (tx) => {
      // Crear reserva
      const booking = await tx.bookings.create({
        data: {
          shop_id: bookingData.shop_id,
          customer_name: bookingData.customer_name,
          customer_email: bookingData.customer_email,
          customer_phone: bookingData.customer_phone,
          booking_date: new Date(bookingData.booking_date),
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          total_duration: bookingData.total_duration,
          total_price: bookingData.total_price,
          status: bookingData.status,
          notes: bookingData.notes
        }
      })

      // Crear servicios de la reserva
      if (services.length > 0) {
        await tx.booking_services.createMany({
          data: services.map(service => ({
            booking_id: booking.id,
            service_id: service.service_id,
            price: service.price,
            duration_minutes: service.duration_minutes
          }))
        })
      }

      // Crear modificadores aplicados
      if (modifiers.length > 0) {
        await tx.booking_service_modifiers.createMany({
          data: modifiers.map(modifier => ({
            booking_id: booking.id,
            service_modifier_id: modifier.service_modifier_id,
            applied_duration: modifier.applied_duration,
            applied_price: modifier.applied_price
          }))
        })
      }

      return booking
    })
  }

  async getById(id: string) {
    return await prisma.bookings.findUnique({
      where: { id },
      include: {
        booking_services: {
          include: {
            services: true
          }
        }
      }
    })
  }

  async getByShopId(shopId: string) {
    return await prisma.bookings.findMany({
      where: { shop_id: shopId },
      include: {
        booking_services: {
          include: {
            services: true
          }
        }
      },
      orderBy: [
        { booking_date: 'asc' },
        { start_time: 'asc' }
      ]
    })
  }

  async getByDateRange(shopId: string, startDate: string, endDate: string) {
    return await prisma.bookings.findMany({
      where: {
        shop_id: shopId,
        booking_date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: {
          in: ['pending', 'confirmed']
        }
      },
      include: {
        booking_services: {
          include: {
            services: true
          }
        }
      },
      orderBy: [
        { booking_date: 'asc' },
        { start_time: 'asc' }
      ]
    })
  }

  async update(id: string, data: Partial<BookingData>) {
    return await prisma.bookings.update({
      where: { id },
      data: {
        ...data,
        booking_date: data.booking_date ? new Date(data.booking_date) : undefined,
        updated_at: new Date()
      }
    })
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    return await prisma.bookings.update({
      where: { id },
      data: { 
        status,
        updated_at: new Date()
      }
    })
  }

  async getAvailableSlots(shopId: string, date: string, schedules: any[], serviceDurationMinutes: number = 60) {
    const bookings = await this.getByDateRange(shopId, date, date)
    const calculator = new AvailabilityCalculator()
    
    return calculator.calculateAvailableSlots(
      date,
      schedules,
      bookings,
      serviceDurationMinutes
    )
  }
}