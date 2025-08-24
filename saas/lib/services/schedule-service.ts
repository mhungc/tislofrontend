// 🕐 Servicio para Gestión de Horarios y Disponibilidad
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

  // 📅 Obtener horarios semanales de una tienda
  async getShopSchedules(shopId: string): Promise<ShopSchedule[]> {
    const response = await fetch(`/api/shops/${shopId}/schedule`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al obtener horarios')
    }
    
    const data = await response.json()
    return data.schedules || []
  }

  // 📅 Obtener un horario específico
  async getShopSchedule(shopId: string, dayOfWeek: number): Promise<ShopSchedule | null> {
    const schedules = await this.getShopSchedules(shopId)
    return schedules.find(s => s.day_of_week === dayOfWeek) || null
  }





  // 🔄 Configurar horario semanal completo
  async setWeeklySchedule(shopId: string, schedules: Omit<ShopScheduleInsert, 'shop_id'>[]): Promise<ShopSchedule[]> {
    const response = await fetch(`/api/shops/${shopId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ schedules }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al guardar horarios')
    }

    const data = await response.json()
    return data.schedules || []
  }


}

