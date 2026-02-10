import { NextRequest, NextResponse } from 'next/server'
import { BookingLinkRepository } from '@/lib/repositories/booking-link-repository'
import { BookingRepository } from '@/lib/repositories/booking-repository'
import { ServiceRepository } from '@/lib/repositories/service-repository'
import { ModifierService } from '@/lib/services/modifier-service'
import { VerificationService } from '@/lib/services/verification-service'
import { BookingEmailService } from '@/lib/services/booking-email-service'
import { calculateBookingTotals } from '@/lib/utils/booking-totals'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const linkRepo = new BookingLinkRepository()
    const bookingRepo = new BookingRepository()
    const serviceRepo = new ServiceRepository()

    const isValid = await linkRepo.isValidToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 404 })
    }

    const bookingLink = await linkRepo.getByToken(token)
    if (!bookingLink?.shops) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      booking_date,
      start_time,
      services: serviceIds,
      notes,
      modifiers: modifierIds = [],
      consent,
      marketing,
      verification_code
    } = await request.json()

    // Validar datos requeridos
    if (!customer_name || !customer_email || !booking_date || !start_time || !serviceIds?.length) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Validar consentimiento RGPD
    if (!consent) {
      return NextResponse.json({ error: 'Consentimiento requerido para procesar datos' }, { status: 400 })
    }

    // Verificar código de verificación
    if (!verification_code) {
      return NextResponse.json({ error: 'Código de verificación requerido' }, { status: 400 })
    }

    const verificationService = new VerificationService()
    const isValidCode = await verificationService.verifyCode(customer_email, verification_code)
    
    if (!isValidCode) {
      return NextResponse.json({ error: 'Código de verificación inválido o expirado' }, { status: 400 })
    }

    // Obtener servicios seleccionados
    const services = await Promise.all(
      serviceIds.map((id: string) => serviceRepo.getByIdForShop(id, bookingLink.shops!.id))
    )

    const validServices = services.filter(Boolean)
    if (validServices.length !== serviceIds.length) {
      return NextResponse.json({ error: 'Algunos servicios no son válidos' }, { status: 400 })
    }

    // Obtener modificadores si se proporcionaron
    const modifierService = new ModifierService()
    let appliedModifiers: any[] = []
    let modifierDurationAdjustment = 0
    let modifierPriceAdjustment = 0

    if (modifierIds.length > 0) {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        appliedModifiers = await Promise.all(
          modifierIds.map(async (id: string) => {
            const { data } = await supabase
              .from('service_modifiers')
              .select('*')
              .eq('id', id)
              .single()
            return data
          })
        )
        
        modifierDurationAdjustment = appliedModifiers.reduce((sum, mod) => sum + (mod?.duration_modifier || 0), 0)
        modifierPriceAdjustment = appliedModifiers.reduce((sum, mod) => sum + (mod?.price_modifier || 0), 0)
      } catch (error) {
        console.warn('Error loading modifiers:', error)
      }
    }

    // Calcular duración y precio total (incluyendo modificadores)
    const { totalDuration, totalPrice } = calculateBookingTotals(
      validServices.map(service => ({
        duration_minutes: service.duration_minutes,
        price: service.price
      })),
      [
        {
          applied_duration: modifierDurationAdjustment,
          applied_price: modifierPriceAdjustment
        }
      ]
    )

    // Calcular hora de fin
    const [hours, minutes] = start_time.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + totalDuration * 60000)
    const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Gestionar cliente (crear o actualizar)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    let customerId = null
    
    // Buscar cliente existente por email
    const { data: existingCustomer, error: searchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customer_email)
      .single()
    
    console.log('Customer search result:', { existingCustomer, searchError })
    
    if (existingCustomer) {
      // Actualizar cliente existente
      customerId = existingCustomer.id
      console.log('Updating existing customer:', customerId)
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          full_name: customer_name,
          phone: customer_phone,
          total_visits: (existingCustomer.total_visits || 0) + 1,
          last_visit_date: new Date().toISOString(),
          loyalty_points: (existingCustomer.loyalty_points || 0) + Math.floor(totalPrice / 10), // 1 punto por cada $10
          marketing_consent: marketing || existingCustomer.marketing_consent,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
      
      if (updateError) console.warn('Error updating customer:', updateError)
    } else {
      // Crear nuevo cliente
      console.log('Creating new customer with data:', {
        full_name: customer_name,
        email: customer_email,
        phone: customer_phone,
        consent_given: true,
        marketing_consent: marketing || false
      })
      
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          full_name: customer_name,
          email: customer_email,
          phone: customer_phone,
          consent_given: true,
          marketing_consent: marketing || false,
          consent_date: new Date().toISOString(),
          data_retention_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 7 años
          total_visits: 1,
          last_visit_date: new Date().toISOString(),
          loyalty_points: Math.floor(totalPrice / 10)
        })
        .select()
        .single()
      
      console.log('Customer creation result:', { newCustomer, createError })
      
      if (createError) {
        console.error('Error creating customer:', createError)
      } else {
        customerId = newCustomer?.id
        console.log('New customer created with ID:', customerId)
      }
    }

    // Crear reserva
    const booking = await bookingRepo.create(
      {
        shop_id: bookingLink.shops.id,
        customer_id: customerId,
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        start_time,
        end_time,
        total_duration: totalDuration,
        total_price: totalPrice,
        status: 'pending',
        notes
      },
      validServices.map(service => ({
        service_id: service.id,
        price: service.price || 0,
        duration_minutes: service.duration_minutes
      })),
      appliedModifiers.map(modifier => ({
        service_modifier_id: modifier.id,
        applied_duration: modifier.duration_modifier || 0,
        applied_price: modifier.price_modifier || 0
      }))
    )

    // Incrementar uso del enlace
    await linkRepo.incrementUse(token)

    // Obtener booking completo con servicios para el email
    const bookingWithDetails = await bookingRepo.getById(booking.id)
    
    // Enviar email de reserva creada
    if (bookingWithDetails && bookingWithDetails.customer_email) {
      const emailService = new BookingEmailService()
      
      const bookingDate = bookingWithDetails.booking_date instanceof Date 
        ? bookingWithDetails.booking_date.toISOString().split('T')[0]
        : bookingWithDetails.booking_date

      const services = bookingWithDetails.booking_services?.map((bs: any) => ({
        name: bs.services?.name || 'Servicio',
        duration_minutes: bs.duration_minutes || 0,
        price: parseFloat(bs.price?.toString() || '0')
      })) || []

      const modifiers = bookingWithDetails.booking_modifiers?.map((mod: any) => ({
        name: mod.service_modifiers?.name || 'Modificador',
        applied_duration: mod.applied_duration || 0,
        applied_price: parseFloat(mod.applied_price?.toString() || '0'),
        duration_modifier: mod.applied_duration || 0,
        price_modifier: parseFloat(mod.applied_price?.toString() || '0')
      })) || []

      const emailTotals = calculateBookingTotals(services, modifiers)

      const emailData = {
        customerName: bookingWithDetails.customer_name || customer_name,
        customerEmail: bookingWithDetails.customer_email,
        bookingDate,
        startTime: bookingWithDetails.start_time,
        endTime: bookingWithDetails.end_time,
        totalDuration: emailTotals.totalDuration,
        totalPrice: emailTotals.totalPrice,
        services,
        modifiers,
        shopName: bookingLink.shops?.name || '',
        shopAddress: bookingLink.shops?.address || null,
        shopPhone: bookingLink.shops?.phone || null,
        notes: bookingWithDetails.notes || notes || undefined
      }

      await emailService.sendBookingCreatedEmail(emailData)
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}