import { BookingRepository, BookingData, BookingServiceData } from '@/lib/repositories/booking-repository'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'

export class BookingService {
  private bookingRepo = new BookingRepository()
  private linkRepo = new BookingLinkRepository()

  async createBookingLink(shopId: string, expiresInDays: number = 30) {
    const response = await fetch(`/api/shops/${shopId}/booking-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ expiresInDays })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear enlace')
    }

    return await response.json()
  }

  async getBookingLinks(shopId: string) {
    const response = await fetch(`/api/shops/${shopId}/booking-links`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener enlaces')
    }

    const data = await response.json()
    return data.links || []
  }

  async getBookingData(token: string) {
    const response = await fetch(`/api/booking/${token}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Enlace inválido o expirado')
    }

    return await response.json()
  }

  async getAvailableSlots(token: string, date: string, serviceIds: string[] = [], additionalDuration: number = 0) {
    const servicesParam = serviceIds.length > 0 ? `&services=${serviceIds.join(',')}` : ''
    const durationParam = additionalDuration > 0 ? `&additionalDuration=${additionalDuration}` : ''
    const response = await fetch(`/api/booking/${token}/availability?date=${date}${servicesParam}${durationParam}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener disponibilidad')
    }

    const data = await response.json()
    return data.slots || []
  }

  async createBooking(token: string, bookingData: {
    customer_name: string
    customer_email: string
    customer_phone?: string
    booking_date: string
    start_time: string
    services: string[]
    notes?: string
    modifiers?: string[]
    consent?: boolean
    marketing?: boolean
    verification_code?: string
  }) {
    const response = await fetch(`/api/booking/${token}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear reserva')
    }

    return await response.json()
  }

  async getBookingsByShop(shopId: string) {
    const bookings = await this.bookingRepo.getByShopId(shopId)
    
    return bookings.map(booking => ({
      ...booking,
      booking_date: booking.booking_date.toISOString().split('T')[0],
      total_price: parseFloat(booking.total_price?.toString() || '0'),
      services: booking.booking_services?.map((bs: any) => ({
        id: bs.services?.id || '',
        name: bs.services?.name || 'Servicio',
        duration_minutes: bs.duration_minutes || 0,
        price: parseFloat(bs.price.toString()) || 0
      })) || []
    }))
  }

  async getBookingsByDateRange(
    shopId: string, 
    startDate: string, 
    endDate: string
  ): Promise<any[]> {
    const bookings = await this.bookingRepo.getByDateRange(shopId, startDate, endDate)
    
    return bookings.map(booking => ({
      ...booking,
      booking_date: booking.booking_date.toISOString().split('T')[0],
      total_price: parseFloat(booking.total_price?.toString() || '0'),
      services: booking.booking_services?.map((bs: any) => ({
        id: bs.services?.id || '',
        name: bs.services?.name || 'Servicio',
        duration_minutes: bs.duration_minutes || 0,
        price: parseFloat(bs.price.toString()) || 0
      })) || []
    }))
  }

  async getBooking(id: string) {
    const booking = await this.bookingRepo.getById(id)
    if (!booking) return null
    
    return {
      ...booking,
      booking_date: booking.booking_date.toISOString().split('T')[0],
      total_price: parseFloat(booking.total_price?.toString() || '0'),
      services: booking.booking_services?.map((bs: any) => ({
        id: bs.services?.id || '',
        name: bs.services?.name || 'Servicio',
        duration_minutes: bs.duration_minutes || 0,
        price: parseFloat(bs.price.toString()) || 0
      })) || []
    }
  }

  async updateBooking(id: string, bookingData: any) {
    return await this.bookingRepo.update(id, bookingData)
  }

  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    return await this.bookingRepo.updateStatus(id, status)
  }

  calculateEndTime(startTime: string, totalMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate.getTime() + totalMinutes * 60000)
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  }

  validateTimeSlot(startTime: string, duration: number, availableSlots: any[], baseSlotMinutes: number = 15): boolean {
    const blockedMinutes = Math.ceil(duration / baseSlotMinutes) * baseSlotMinutes
    const slotsNeeded = blockedMinutes / baseSlotMinutes
    const startIndex = availableSlots.findIndex(slot => slot.time === startTime)
    
    if (startIndex === -1) return false
    
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = startIndex + i
      if (slotIndex >= availableSlots.length || !availableSlots[slotIndex].available) {
        return false
      }
    }
    
    return true
  }

  async createManualBooking(shopId: string, bookingData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    booking_date: string
    start_time: string
    end_time: string
    service_id: string
    notes: string
    total_duration: number
    total_price: number
  }) {
    const response = await fetch(`/api/shops/${shopId}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear reserva')
    }

    return await response.json()
  }
}