import { PrismaClient, Prisma } from '@prisma/client'

export interface CreateShopInput {
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Prisma.InputJsonValue | null
}

export interface UpdateShopInput {
  name?: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
  business_hours?: Prisma.InputJsonValue | null
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
    const data: Prisma.ShopCreateInput = {
      owner_id: input.owner_id,
      name: input.name,
      description: input.description ?? undefined,
      address: input.address ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      website: input.website ?? undefined,
      timezone: input.timezone ?? undefined,
      business_hours: input.business_hours ?? undefined,
      is_active: true,
    }
    return prisma.shop.create({ data })
  }

  async update(shopId: string, input: UpdateShopInput) {
    const data: Prisma.ShopUpdateInput = {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
      address: input.address ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      website: input.website ?? undefined,
      timezone: input.timezone ?? undefined,
      business_hours: input.business_hours ?? undefined,
      is_active: input.is_active ?? undefined,
    }
    return prisma.shop.update({ where: { id: shopId }, data })
  }

  async delete(shopId: string) {
    await prisma.shop.delete({ where: { id: shopId } })
  }
}


