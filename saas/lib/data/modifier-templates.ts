import { ServiceModifierData } from '@/lib/types/modifiers'

export const MODIFIER_TEMPLATES: Record<string, ServiceModifierData[]> = {
  peluqueria: [
    {
      name: 'Niños con necesidades especiales',
      description: 'Tiempo adicional para niños que requieren atención especializada',
      condition_type: 'customer_tag',
      condition_value: { tag: 'necesidades_especiales' },
      duration_modifier: 20,
      price_modifier: 5,
      is_active: true,
      auto_apply: true
    },
    {
      name: 'Primera visita',
      description: 'Tiempo extra para explicar el proceso a nuevos clientes',
      condition_type: 'first_visit',
      condition_value: {},
      duration_modifier: 10,
      price_modifier: 0,
      is_active: true,
      auto_apply: true
    },
    {
      name: 'Niños menores de 5 años',
      description: 'Tiempo adicional para niños pequeños',
      condition_type: 'age_range',
      condition_value: { min_age: 0, max_age: 5 },
      duration_modifier: 15,
      price_modifier: 0,
      is_active: true,
      auto_apply: true
    }
  ]
}