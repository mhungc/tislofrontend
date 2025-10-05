import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateScheduleInput {
  shop_id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_working_day: boolean
  block_order?: number
}

export interface UpdateScheduleInput {
  open_time?: string
  close_time?: string
  is_working_day?: boolean
  block_order?: number
}

export class ScheduleRepository {
  async getByShopId(shopId: string) {
    return prisma.shop_schedules.findMany({
      where: { shop_id: shopId },
      orderBy: [
        { day_of_week: 'asc' },
        { block_order: 'asc' }
      ]
    })
  }

  async getByShopAndDay(shopId: string, dayOfWeek: number) {
    return prisma.shop_schedules.findMany({
      where: { 
        shop_id: shopId,
        day_of_week: dayOfWeek
      },
      orderBy: { block_order: 'asc' }
    })
  }

  async create(input: CreateScheduleInput) {
    return prisma.shop_schedules.create({
      data: input
    })
  }

  async createMany(schedules: CreateScheduleInput[]) {
    return prisma.shop_schedules.createMany({
      data: schedules,
      skipDuplicates: true
    })
  }

  async deleteByShopId(shopId: string) {
    return prisma.shop_schedules.deleteMany({
      where: { shop_id: shopId }
    })
  }

  async replaceSchedules(shopId: string, schedules: CreateScheduleInput[]) {
    return prisma.$transaction(async (tx) => {
      // Eliminar horarios existentes
      await tx.shop_schedules.deleteMany({
        where: { shop_id: shopId }
      })

      // Insertar nuevos horarios
      if (schedules.length > 0) {
        await tx.shop_schedules.createMany({
          data: schedules
        })
      }

      // Retornar los horarios creados
      return tx.shop_schedules.findMany({
        where: { shop_id: shopId },
        orderBy: [
          { day_of_week: 'asc' },
          { block_order: 'asc' }
        ]
      })
    })
  }
}