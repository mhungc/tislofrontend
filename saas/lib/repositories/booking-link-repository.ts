import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export interface BookingLinkData {
  shop_id: string
  token: string
  expires_at: Date
  is_active: boolean
  max_uses?: number
  current_uses: number
}

export class BookingLinkRepository {
  
  async create(shopId: string, expiresInDays: number = 30, maxUses?: number) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    return await prisma.booking_links.create({
      data: {
        shop_id: shopId,
        token,
        expires_at: expiresAt,
        is_active: true,
        max_uses: maxUses,
        current_uses: 0
      }
    })
  }

  async getByToken(token: string) {
    return await prisma.booking_links.findUnique({
      where: { token },
      include: {
        shops: {
          include: {
            schedules: {
              where: { is_working_day: true },
              orderBy: [{ day_of_week: 'asc' }, { block_order: 'asc' }]
            },
            services: {
              where: { is_active: true }
            }
          }
        }
      }
    })
  }

  async incrementUse(token: string) {
    return await prisma.booking_links.update({
      where: { token },
      data: {
        current_uses: {
          increment: 1
        }
      }
    })
  }

  async getByShopId(shopId: string) {
    return await prisma.booking_links.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' }
    })
  }

  async deactivate(id: string) {
    return await prisma.booking_links.update({
      where: { id },
      data: { is_active: false }
    })
  }

  async isValidToken(token: string): Promise<boolean> {
    const link = await this.getByToken(token)
    
    if (!link || !link.is_active) return false
    if (link.expires_at < new Date()) return false
    if (link.max_uses && (link.current_uses || 0) >= link.max_uses) return false
    
    return true
  }
}