export type NumericLike = number | string | { toString(): string } | null | undefined

export interface BookingServiceLine {
  duration_minutes: number
  price?: NumericLike
}

export interface BookingModifierLine {
  applied_duration?: number | null
  applied_price?: NumericLike
}

const toNumber = (value: NumericLike): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0

  const parsed = typeof value === 'string'
    ? parseFloat(value)
    : parseFloat(value.toString())

  return Number.isFinite(parsed) ? parsed : 0
}

export const calculateBookingTotals = (
  services: BookingServiceLine[],
  modifiers: BookingModifierLine[] = []
) => {
  const baseDuration = services.reduce(
    (sum, service) => sum + (Number(service.duration_minutes) || 0),
    0
  )

  const basePrice = services.reduce(
    (sum, service) => sum + toNumber(service.price),
    0
  )

  const modifierDuration = modifiers.reduce(
    (sum, modifier) => sum + (Number(modifier.applied_duration) || 0),
    0
  )

  const modifierPrice = modifiers.reduce(
    (sum, modifier) => sum + toNumber(modifier.applied_price),
    0
  )

  return {
    totalDuration: baseDuration + modifierDuration,
    totalPrice: basePrice + modifierPrice,
    baseDuration,
    basePrice,
    modifierDuration,
    modifierPrice
  }
}
