import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateServiceInput {
  shop_id: string
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  is_active?: boolean
}

export interface UpdateServiceInput {
  name?: string
  description?: string | null
  duration_minutes?: number
  price?: number | null
  is_active?: boolean
}

export class ServiceRepository {
  async getByShopId(shopId: string) {
    return prisma.services.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' }
    })
  }

  async getById(serviceId: string) {
    return prisma.services.findUnique({
      where: { id: serviceId }
    })
  }

  async getByIdForShop(serviceId: string, shopId: string) {
    return prisma.services.findFirst({
      where: { 
        id: serviceId,
        shop_id: shopId
      }
    })
  }

  async create(input: CreateServiceInput) {
    return prisma.services.create({
      data: {
        shop_id: input.shop_id,
        name: input.name,
        description: input.description,
        duration_minutes: input.duration_minutes,
        price: input.price,
        is_active: input.is_active ?? true
      }
    })
  }

  async update(serviceId: string, input: UpdateServiceInput) {
    return prisma.services.update({
      where: { id: serviceId },
      data: {
        name: input.name,
        description: input.description,
        duration_minutes: input.duration_minutes,
        price: input.price,
        is_active: input.is_active
      }
    })
  }

  async delete(serviceId: string) {
    return prisma.services.delete({
      where: { id: serviceId }
    })
  }

  async toggleActive(serviceId: string) {
    const service = await this.getById(serviceId)
    if (!service) throw new Error('Servicio no encontrado')
    
    return this.update(serviceId, { is_active: !service.is_active })
  }
}