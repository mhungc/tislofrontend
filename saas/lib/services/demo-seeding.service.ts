import { prisma } from '@/lib/prisma'
import { ShopRepository } from '@/lib/repositories/shop-repository'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ScheduleRepository } from '@/lib/repositories/schedule-repository'
import { calculateBookingTotals } from '@/lib/utils/booking-totals'

export interface DemoServiceData {
  name: string
  description?: string
  price: number
  duration_minutes: number
  category?: string
}

export interface DemoScheduleData {
  day_of_week: number
  open_time: string
  close_time: string
  is_working_day: boolean
}

export interface DemoBookingData {
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_date: string
  start_time: string
  end_time: string
  services: string[]
  status: 'pending' | 'confirmed' | 'cancelled'
}

export class DemoSeedingService {
  private shopRepository = new ShopRepository()
  private serviceRepository = new ServiceRepository()
  private bookingRepository = new BookingRepository()
  private scheduleRepository = new ScheduleRepository()

  private demoShopData = {
    name: "Salón Bella Vista",
    description: "Salón de belleza integral con servicios premium",
    address: "Av. Principal 123, Centro",
    phone: "+1 (555) 123-4567",
    email: "contacto@salonbellavista.com",
    website: "https://salonbellavista.com"
  }

  private demoServices: DemoServiceData[] = [
    { name: "Corte de Cabello", price: 25, duration_minutes: 45, category: "Cabello" },
    { name: "Tinte Completo", price: 80, duration_minutes: 120, category: "Cabello" },
    { name: "Mechas", price: 65, duration_minutes: 90, category: "Cabello" },
    { name: "Tratamiento Capilar", price: 35, duration_minutes: 60, category: "Cabello" },
    { name: "Manicure", price: 15, duration_minutes: 30, category: "Uñas" },
    { name: "Pedicure", price: 20, duration_minutes: 45, category: "Uñas" },
    { name: "Uñas Gel", price: 30, duration_minutes: 60, category: "Uñas" },
    { name: "Limpieza Facial", price: 40, duration_minutes: 75, category: "Facial" },
    { name: "Masaje Relajante", price: 50, duration_minutes: 60, category: "Bienestar" }
  ]

  private demoSchedule: DemoScheduleData[] = [
    { day_of_week: 1, open_time: "09:00", close_time: "18:00", is_working_day: true },
    { day_of_week: 2, open_time: "09:00", close_time: "18:00", is_working_day: true },
    { day_of_week: 3, open_time: "09:00", close_time: "18:00", is_working_day: true },
    { day_of_week: 4, open_time: "09:00", close_time: "18:00", is_working_day: true },
    { day_of_week: 5, open_time: "09:00", close_time: "19:00", is_working_day: true },
    { day_of_week: 6, open_time: "08:00", close_time: "17:00", is_working_day: true },
    { day_of_week: 0, open_time: "10:00", close_time: "15:00", is_working_day: false }
  ]

  private demoBookings: DemoBookingData[] = [
    {
      customer_name: "María González",
      customer_email: "maria@email.com",
      customer_phone: "+1-555-0101",
      booking_date: "2025-10-06",
      start_time: "10:00",
      end_time: "10:45",
      services: ["Corte de Cabello"],
      status: "confirmed"
    },
    {
      customer_name: "Ana Rodríguez",
      customer_email: "ana@email.com",
      customer_phone: "+1-555-0102",
      booking_date: "2025-10-06",
      start_time: "14:30",
      end_time: "16:30",
      services: ["Tinte Completo"],
      status: "confirmed"
    },
    {
      customer_name: "Carmen López",
      customer_email: "carmen@email.com",
      customer_phone: "+1-555-0103",
      booking_date: "2025-10-07",
      start_time: "11:00",
      end_time: "12:15",
      services: ["Manicure", "Pedicure"],
      status: "pending"
    },
    {
      customer_name: "Sofia Martín",
      customer_email: "sofia@email.com",
      customer_phone: "+1-555-0104",
      booking_date: "2025-10-08",
      start_time: "09:30",
      end_time: "10:45",
      services: ["Limpieza Facial"],
      status: "confirmed"
    },
    {
      customer_name: "Laura Fernández",
      customer_email: "laura@email.com",
      customer_phone: "+1-555-0105",
      booking_date: "2025-10-09",
      start_time: "15:00",
      end_time: "16:45",
      services: ["Corte de Cabello", "Tratamiento Capilar"],
      status: "confirmed"
    },
    {
      customer_name: "Patricia Morales",
      customer_email: "patricia@email.com",
      customer_phone: "+1-555-0106",
      booking_date: "2025-10-10",
      start_time: "16:00",
      end_time: "17:00",
      services: ["Uñas Gel"],
      status: "confirmed"
    },
    {
      customer_name: "Isabella Castro",
      customer_email: "isabella@email.com",
      customer_phone: "+1-555-0107",
      booking_date: "2025-10-11",
      start_time: "10:30",
      end_time: "12:00",
      services: ["Mechas"],
      status: "pending"
    }
  ]

  async isUserDemo(userId: string): Promise<boolean> {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { is_demo: true }
      })
      return profile?.is_demo || false
    } catch (error) {
      console.error('Error verificando demo:', error)
      return false
    }
  }

  async seedDemoDataForUser(userId: string): Promise<void> {
    try {
      console.log('🚀 [DEMO-SEED] Iniciando seeding demo para usuario:', userId)
      
      // Verificar si ya tiene datos demo
      const existingDemoShop = await this.shopRepository.listByOwner(userId)
      if (existingDemoShop.length > 0) {
        console.log('⚠️ [DEMO-SEED] Usuario ya tiene datos demo, omitiendo seeding')
        return
      }

      // Marcar perfil como demo
      await prisma.profiles.update({
        where: { id: userId },
        data: { is_demo: true }
      })

      // Crear tienda demo
      const demoShop = await this.shopRepository.create({
        owner_id: userId,
        ...this.demoShopData
      })
      console.log('✅ [DEMO-SEED] Tienda demo creada:', demoShop.name)

      // Crear servicios demo
      const createdServices: { [key: string]: string } = {}
      for (const serviceData of this.demoServices) {
        const service = await this.serviceRepository.create({
          shop_id: demoShop.id,
          name: serviceData.name,
          description: serviceData.description || `Servicio de ${serviceData.category}`,
          duration_minutes: serviceData.duration_minutes,
          price: serviceData.price,
          is_active: true
        })
        createdServices[serviceData.name] = service.id
      }

      // Crear horarios demo
      for (const scheduleData of this.demoSchedule) {
        const openTime = new Date(`1970-01-01T${scheduleData.open_time}:00.000Z`)
        const closeTime = new Date(`1970-01-01T${scheduleData.close_time}:00.000Z`)
        
        await this.scheduleRepository.create({
          shop_id: demoShop.id,
          day_of_week: scheduleData.day_of_week,
          open_time: openTime.toISOString(),
          close_time: closeTime.toISOString(),
          is_working_day: scheduleData.is_working_day
        })
      }

      // Crear enlace de reserva demo
      const bookingLink = await prisma.booking_links.create({
        data: {
          shop_id: demoShop.id,
          token: `demo-${demoShop.id}-${Date.now()}`,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          is_active: true,
          max_uses: 1000,
          current_uses: 0
        }
      })

      // Crear reservas demo
      for (const bookingData of this.demoBookings) {
        let customer = await prisma.customers.findFirst({
          where: {
            OR: [
              { email: bookingData.customer_email },
              { phone: bookingData.customer_phone }
            ]
          }
        })

        if (!customer) {
          customer = await prisma.customers.create({
            data: {
              email: bookingData.customer_email,
              phone: bookingData.customer_phone,
              full_name: bookingData.customer_name,
              consent_given: true,
              consent_date: new Date(),
              marketing_consent: false,
              data_retention_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
              total_visits: 1,
              last_visit_date: new Date(),
              loyalty_points: 0
            }
          })
        }

        const bookingServices = bookingData.services.map(serviceName => ({
          service_id: createdServices[serviceName],
          price: this.demoServices.find(s => s.name === serviceName)?.price || 0,
          duration_minutes: this.demoServices.find(s => s.name === serviceName)?.duration_minutes || 60
        }))

        const totals = calculateBookingTotals(bookingServices)

        await this.bookingRepository.create({
          shop_id: demoShop.id,
          customer_id: customer.id,
          customer_name: bookingData.customer_name,
          customer_email: bookingData.customer_email,
          customer_phone: bookingData.customer_phone,
          booking_date: bookingData.booking_date,
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          total_duration: totals.totalDuration,
          total_price: totals.totalPrice,
          status: bookingData.status as 'pending' | 'confirmed' | 'cancelled',
          notes: 'Reserva de demostración'
        }, bookingServices, [])
      }

      console.log('✅ [DEMO-SEED] Datos demo creados exitosamente')
      console.log(`  - Enlace: /book/${bookingLink.token}`)
    } catch (error) {
      console.error('Error creando datos demo:', error)
      throw new Error('Error al crear datos de demostración')
    }
  }

  async clearDemoDataForUser(userId: string): Promise<void> {
    try {
      const userShops = await this.shopRepository.listByOwner(userId)
      
      for (const shop of userShops) {
        await this.shopRepository.delete(shop.id)
      }

      await prisma.profiles.update({
        where: { id: userId },
        data: { is_demo: false }
      })

      console.log('Datos demo eliminados exitosamente')
    } catch (error) {
      console.error('Error eliminando datos demo:', error)
      throw new Error('Error al eliminar datos de demostración')
    }
  }
}