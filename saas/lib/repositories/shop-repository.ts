import { PrismaClient } from '@prisma/client'

export interface CreateShopInput {
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Record<string, unknown> | null
}

export interface UpdateShopInput {
  name?: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Record<string, unknown> | null
  is_active?: boolean
}

const prisma = new PrismaClient()

export class ShopRepository {
  async listByOwner(ownerId: string) {
    return prisma.shop.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: 'desc' }
    })
  }

  async getByIdForOwner(shopId: string, ownerId: string) {
    return prisma.shop.findFirst({ where: { id: shopId, owner_id: ownerId } })
  }

  async create(input: CreateShopInput) {
    return prisma.shop.create({ data: input })
  }

  async update(shopId: string, input: UpdateShopInput) {
    return prisma.shop.update({ where: { id: shopId }, data: input })
  }

  async delete(shopId: string) {
    await prisma.shop.delete({ where: { id: shopId } })
  }
}

