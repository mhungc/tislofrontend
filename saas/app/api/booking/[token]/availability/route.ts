import { NextRequest, NextResponse } from 'next/server'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'

function parseDateWeekday(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay()
}

function toHHMM(value: Date | string): string {
  if (value instanceof Date) {
    return `${value.getUTCHours().toString().padStart(2, '0')}:${value.getUTCMinutes().toString().padStart(2, '0')}`
  }

  const str = String(value)
  if (str.includes('T')) {
    const hhmm = str.split('T')[1]?.slice(0, 5)
    return hhmm || str.slice(0, 5)
  }

  return str.slice(0, 5)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const DEBUG_TAG = '[BOOKING_DEBUG]'
    const { token } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceIds = searchParams.get('services')?.split(',').filter(Boolean) || []
    const additionalDuration = parseInt(searchParams.get('additionalDuration') || '0', 10)

    if (!date) {
      return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })
    }

    const linkRepo = new BookingLinkRepository()
    const bookingRepo = new BookingRepository()

    const isValid = await linkRepo.isValidToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 })
    }

    const bookingLink = await linkRepo.getByToken(token)
    if (!bookingLink?.shops) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Calcular duración total de servicios seleccionados + modificadores
    let totalDuration = 60 // Default 1 hora
    if (serviceIds.length > 0) {
      const serviceLookup = new Map(
        bookingLink.shops.services.map(service => [service.id, service])
      )

      totalDuration = serviceIds.reduce((sum, serviceId) => {
        const service = serviceLookup.get(serviceId)
        return sum + (service?.duration_minutes || 0)
      }, 0)
      
      // Agregar duración adicional de modificadores
      totalDuration += additionalDuration
    }
    
    // Permitir override por query param (slotStepMinutes), si se quiere
    let slotStepMinutes: number | undefined = undefined
    const slotStepParam = searchParams.get('slotStepMinutes')
    if (slotStepParam) {
      const parsed = parseInt(slotStepParam, 10)
      if (!isNaN(parsed) && parsed >= 5 && parsed <= 60) {
        slotStepMinutes = parsed
      }
    }

    // Usar base_slot_minutes de la tienda como default
    const baseSlotMinutes = slotStepMinutes ?? (bookingLink.shops.base_slot_minutes ?? 15)

    // Usar buffer_minutes de la tienda (default 0)
    const bufferMinutes = bookingLink.shops.buffer_minutes ?? 0

    const timezone = bookingLink.shops.timezone || 'UTC'
    const requestedDayOfWeek = parseDateWeekday(date)
    const daySchedules = bookingLink.shops.schedules.filter((s: any) => s.day_of_week === requestedDayOfWeek)

    console.log(`${DEBUG_TAG} availability-server-input`, {
      tokenPreview: token.slice(0, 8),
      shopId: bookingLink.shops.id,
      timezone,
      requestedDate: date,
      requestedDayOfWeek,
      nowIso: new Date().toISOString(),
      serviceIds,
      additionalDuration,
      totalDuration,
      baseSlotMinutes,
      bufferMinutes,
      schedulesCount: bookingLink.shops.schedules.length,
      requestedDaySchedulesCount: daySchedules.length,
      requestedDaySchedules: daySchedules.map((s: any) => ({
        day_of_week: s.day_of_week,
        is_working_day: s.is_working_day,
        block_order: s.block_order,
        open_time: toHHMM(s.open_time),
        close_time: toHHMM(s.close_time)
      }))
    })

    const result = await bookingRepo.getAvailableSlots(
      bookingLink.shops.id,
      date,
      bookingLink.shops.schedules,
      totalDuration,
      baseSlotMinutes,
      bufferMinutes,
      timezone
    )

    const resultWithGaps = result && typeof result === 'object' && 'slots' in result && 'fillableGaps' in result
      ? result
      : null
    const slotsForLog = resultWithGaps
      ? resultWithGaps.slots
      : (Array.isArray(result) ? result : [])
    const fillableGapsForLog = resultWithGaps ? resultWithGaps.fillableGaps : []

    console.log(`${DEBUG_TAG} availability-server-output`, {
      requestedDate: date,
      slotsCount: Array.isArray(slotsForLog) ? slotsForLog.length : 0,
      availableSlotsCount: Array.isArray(slotsForLog) ? slotsForLog.filter((s: any) => s?.available).length : 0,
      fillableGapsCount: Array.isArray(fillableGapsForLog) ? fillableGapsForLog.length : 0,
      firstSlots: Array.isArray(slotsForLog) ? slotsForLog.slice(0, 8) : slotsForLog
    })

    // Compatibilidad: si result tiene slots y fillableGaps, devolver ambos
    if (result && typeof result === 'object' && 'slots' in result && 'fillableGaps' in result) {
      return NextResponse.json({ slots: result.slots, fillableGaps: result.fillableGaps })
    }
    // Legacy: solo slots
    return NextResponse.json({ slots: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}