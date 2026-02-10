import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateShopInput {
  owner_id: string
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email: string
  website?: string | null
  timezone?: string | null
}

export interface UpdateShopInput {
  name?: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  timezone?: string | null
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
    return prisma.shops.create({
      data: {
        owner_id: input.owner_id,
        name: input.name,
        description: input.description ?? undefined,
        address: input.address ?? undefined,
        phone: input.phone ?? undefined,
        email: input.email,
        website: input.website ?? undefined,
        timezone: input.timezone ?? 'America/New_York',
        is_active: true,
      }
    })
  }

  async update(shopId: string, input: UpdateShopInput) {
    const data: Prisma.shopsUpdateInput = {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
      address: input.address ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      website: input.website ?? undefined,
      timezone: input.timezone ?? undefined,
      is_active: input.is_active ?? undefined,
    }
    return prisma.shops.update({ where: { id: shopId }, data })
  }

  async delete(shopId: string) {
    await prisma.$transaction(async (tx) => {
      // Eliminar booking_services primero
      const bookings = await tx.bookings.findMany({
        where: { shop_id: shopId },
        select: { id: true }
      })
      
      if (bookings.length > 0) {
        await tx.booking_services.deleteMany({
          where: {
            booking_id: { in: bookings.map(b => b.id) }
          }
        })
      }

      // Eliminar service_modifiers
      const services = await tx.services.findMany({
        where: { shop_id: shopId },
        select: { id: true }
      })
      
      if (services.length > 0) {
        await tx.service_modifiers.deleteMany({
          where: {
            service_id: { in: services.map(s => s.id) }
          }
        })
      }

      // Eliminar el resto en orden
      await tx.bookings.deleteMany({ where: { shop_id: shopId } })
      await tx.booking_links.deleteMany({ where: { shop_id: shopId } })
      await tx.services.deleteMany({ where: { shop_id: shopId } })
      await tx.schedule_exceptions.deleteMany({ where: { shop_id: shopId } })
      await tx.shop_schedules.deleteMany({ where: { shop_id: shopId } })
      
      // Finalmente eliminar la tienda
      await tx.shops.delete({ where: { id: shopId } })
    })
  }
}


