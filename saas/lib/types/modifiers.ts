export type ConditionType = 'customer_tag' | 'age_range' | 'first_visit' | 'manual'

export interface ServiceModifier {
  id: string
  service_id: string
  name: string
  description?: string
  condition_type: ConditionType
  condition_value?: any
  duration_modifier: number
  price_modifier: number
  is_active: boolean
  auto_apply: boolean
  created_at?: string
  updated_at?: string
}

export interface ServiceModifierData {
  name: string
  description?: string
  condition_type: ConditionType
  condition_value?: any
  duration_modifier: number
  price_modifier: number
  is_active: boolean
  auto_apply: boolean
}

export interface CustomerTag {
  id: string
  customer_id: string
  tag: string
  value?: string
  created_at?: string
}

export interface BookingServiceModifier {
  id: string
  booking_id: string
  service_modifier_id: string
  applied_duration: number
  applied_price: number
  applied_at?: string
}

// Condiciones específicas
export interface AgeRangeCondition {
  min_age?: number
  max_age?: number
}

export interface CustomerTagCondition {
  tag: string
  value?: string
}

export interface FirstVisitCondition {
  shop_id: string
}