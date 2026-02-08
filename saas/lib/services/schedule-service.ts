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
    try {
      const response = await fetch(`/api/shops/${shopId}/schedule`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Si no hay horarios, devolver array vacío en lugar de error
        if (response.status === 404) {
          return []
        }
        throw new Error('Error al obtener horarios')
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return []
      }
      
      const data = await response.json()
      return data.schedules || []
    } catch (error) {
      console.error('Error en getShopSchedules:', error)
      return []
    }
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

  // 📊 Calcular disponibilidad para un rango de fechas
  async calculateAvailability(
    shopId: string, 
    startDate: string, 
    endDate: string, 
    serviceIds: string[] = []
  ): Promise<DayAvailability[]> {
    const servicesParam = serviceIds.length > 0 ? `&services=${serviceIds.join(',')}` : ''
    const response = await fetch(
      `/api/shops/${shopId}/calendar?start=${startDate}&end=${endDate}${servicesParam}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al calcular disponibilidad')
    }

    const data = await response.json()
    return data.calendar || []
  }

  // 📅 Obtener excepciones de horario
  async getScheduleExceptions(
    shopId: string,
    startDate: string,
    endDate: string
  ): Promise<ScheduleException[]> {
    try {
      const response = await fetch(
        `/api/shops/${shopId}/schedule/exceptions?start=${startDate}&end=${endDate}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        throw new Error('Error al obtener excepciones')
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return []
      }

      const data = await response.json()
      return data.exceptions || []
    } catch (error) {
      console.error('Error en getScheduleExceptions:', error)
      return []
    }
  }

  // ➕ Crear excepción de horario
  async createScheduleException(exceptionData: Omit<ScheduleExceptionInsert, 'id'>): Promise<ScheduleException> {
    const response = await fetch('/api/schedule/exceptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(exceptionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear excepción')
    }

    const data = await response.json()
    return data.exception
  }

  // 🗑️ Eliminar excepción de horario
  async deleteScheduleException(exceptionId: string): Promise<void> {
    const response = await fetch(`/api/schedule/exceptions/${exceptionId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar excepción')
    }
  }

}

