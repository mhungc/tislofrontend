import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateShopInput {
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
}

export interface UpdateShopInput {
  name?: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  is_active?: boolean
}

export class ShopRepository {
  async listByOwner(ownerId: string) {
    return prisma.shops.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: 'desc' }
    })
  }

  async getByIdForOwner(shopId: string, ownerId: string) {
    return prisma.shops.findFirst({ where: { id: shopId, owner_id: ownerId } })
  }

  async create(input: CreateShopInput) {
    const data: Prisma.shopsCreateInput = {
      id: input.owner_id,
      name: input.name,
      description: input.description ?? undefined,
      address: input.address ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      website: input.website ?? undefined,
      is_active: true,
    }
    return prisma.shops.create({ data })
  }

  async update(shopId: string, input: UpdateShopInput) {
    const data: Prisma.shopsUpdateInput = {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
      address: input.address ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      website: input.website ?? undefined,
      is_active: input.is_active ?? undefined,
    }
    return prisma.shops.update({ where: { id: shopId }, data })
  }

  async delete(shopId: string) {
    await prisma.shops.delete({ where: { id: shopId } })
  }
}


