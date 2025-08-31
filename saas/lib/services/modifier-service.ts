import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import { ServiceModifier, ServiceModifierData, CustomerTag } from '@/lib/types/modifiers'

export class ModifierService {
  async getServiceModifiers(serviceId: string): Promise<ServiceModifier[]> {
    try {
      const { data, error } = await supabase
        .from('service_modifiers')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.warn('Modificadores no disponibles:', error.message)
        return []
      }
      return data || []
    } catch (error) {
      console.warn('Error al cargar modificadores:', error)
      return []
    }
  }

  async createModifier(serviceId: string, modifierData: ServiceModifierData): Promise<ServiceModifier> {
    try {
      const { data, error } = await supabase
        .from('service_modifiers')
        .insert({
          service_id: serviceId,
          ...modifierData
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating modifier:', error)
        throw new Error('No se pudo crear el modificador')
      }
      return data
    } catch (error) {
      console.error('Create modifier failed:', error)
      throw error
    }
  }

  async updateModifier(modifierId: string, modifierData: Partial<ServiceModifierData>): Promise<ServiceModifier> {
    try {
      const { data, error } = await supabase
        .from('service_modifiers')
        .update(modifierData)
        .eq('id', modifierId)
        .select()
        .single()

      if (error) {
        console.error('Error updating modifier:', error)
        throw new Error('No se pudo actualizar el modificador')
      }
      return data
    } catch (error) {
      console.error('Update modifier failed:', error)
      throw error
    }
  }

  async deleteModifier(modifierId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('service_modifiers')
        .delete()
        .eq('id', modifierId)

      if (error) {
        console.error('Error deleting modifier:', error)
        throw new Error('No se pudo eliminar el modificador')
      }
    } catch (error) {
      console.error('Delete modifier failed:', error)
      throw error
    }
  }

  async getCustomerTags(customerId: string): Promise<CustomerTag[]> {
    const { data, error } = await supabase
      .from('customer_tags')
      .select('*')
      .eq('customer_id', customerId)

    if (error) throw error
    return data || []
  }

  async addCustomerTag(customerId: string, tag: string, value?: string): Promise<CustomerTag> {
    const { data, error } = await supabase
      .from('customer_tags')
      .upsert({
        customer_id: customerId,
        tag,
        value
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getApplicableModifiers(serviceId: string, customerData: any): Promise<ServiceModifier[]> {
    const modifiers = await this.getServiceModifiers(serviceId)
    const applicable: ServiceModifier[] = []

    for (const modifier of modifiers) {
      if (await this.checkCondition(modifier, customerData)) {
        applicable.push(modifier)
      }
    }

    return applicable
  }

  private async checkCondition(modifier: ServiceModifier, customerData: any): Promise<boolean> {
    switch (modifier.condition_type) {
      case 'customer_tag':
        return this.checkCustomerTag(modifier, customerData)
      case 'age_range':
        return this.checkAgeRange(modifier, customerData)
      case 'first_visit':
        return this.checkFirstVisit(modifier, customerData)
      case 'manual':
        return false // Requiere aplicación manual
      default:
        return false
    }
  }

  private checkCustomerTag(modifier: ServiceModifier, customerData: any): boolean {
    const condition = modifier.condition_value
    if (!condition?.tag || !customerData.tags) return false
    
    return customerData.tags.some((tag: CustomerTag) => 
      tag.tag === condition.tag && 
      (!condition.value || tag.value === condition.value)
    )
  }

  private checkAgeRange(modifier: ServiceModifier, customerData: any): boolean {
    const condition = modifier.condition_value
    if (!customerData.birth_date) return false

    const age = this.calculateAge(new Date(customerData.birth_date))
    const minAge = condition?.min_age || 0
    const maxAge = condition?.max_age || 150

    return age >= minAge && age <= maxAge
  }

  private async checkFirstVisit(modifier: ServiceModifier, customerData: any): Promise<boolean> {
    if (!customerData.customer_id) return false

    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('customer_id', customerData.customer_id)
      .eq('status', 'confirmed')
      .limit(1)

    return !data || data.length === 0
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }
}