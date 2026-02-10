import { Resend } from 'resend'

interface BookingEmailData {
  customerName: string
  customerEmail: string
  bookingDate: string
  startTime: string
  endTime: string
  totalDuration: number
  totalPrice: number
  services: Array<{
    name: string
    duration_minutes: number
    price: number
  }>
  modifiers?: Array<{
    name: string
    duration_modifier: number
    price_modifier: number
  }>
  shopName: string
  shopAddress?: string | null
  shopPhone?: string | null
  notes?: string | null
}

export class BookingEmailService {
  private resend = new Resend(process.env.RESEND_API_KEY)

  private formatDate(date: string): string {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Envía email cuando se crea una nueva reserva (pendiente)
   */
  async sendBookingCreatedEmail(data: BookingEmailData): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY no configurada, email no enviado')
        return
      }

      const formattedDate = this.formatDate(data.bookingDate)
      const formattedStartTime = this.formatTime(data.startTime)
      const formattedEndTime = this.formatTime(data.endTime)
      const formattedTotal = this.formatCurrency(data.totalPrice)

      const servicesList = data.services
        .map(
          (service) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${service.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${service.duration_minutes} min</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${this.formatCurrency(service.price)}</td>
        </tr>
      `
        )
        .join('')

      const modifiersList = (data.modifiers && data.modifiers.length > 0) ? data.modifiers
        .map(
          (modifier) => `
        <tr>
          <td style="padding: 8px 8px 8px 24px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">↳ ${modifier.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">${modifier.duration_modifier > 0 ? '+' : ''}${modifier.duration_modifier} min</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 14px;">${modifier.price_modifier > 0 ? '+' : ''}${this.formatCurrency(modifier.price_modifier)}</td>
        </tr>
      `
        )
        .join('') : ''

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reserva Recibida</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📅 Reserva Recibida</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hola <strong>${data.customerName}</strong>,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                ¡Gracias por tu reserva! Hemos recibido tu solicitud y está <strong style="color: #eab308;">pendiente de confirmación</strong>. 
                Te notificaremos tan pronto como sea confirmada.
              </p>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #eab308;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⏳ Estado:</strong> Pendiente de confirmación<br>
                  Recibirás un email de confirmación una vez que tu reserva sea aprobada.
                </p>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #eab308; padding-bottom: 10px;">
                  📅 Detalles de tu Reserva
                </h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Fecha:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedDate}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Horario:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedStartTime} - ${formattedEndTime}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Duración:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.totalDuration} minutos</span>
                </div>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #eab308; padding-bottom: 10px;">
                  🏪 Información del Negocio
                </h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Nombre:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopName}</span>
                </div>
                
                ${data.shopAddress ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Dirección:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopAddress}</span>
                </div>
                ` : ''}
                
                ${data.shopPhone ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Teléfono:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopPhone}</span>
                </div>
                ` : ''}
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #eab308; padding-bottom: 10px;">
                  🛠️ Servicios Reservados
                </h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Servicio</th>
                      <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Duración</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesList}
                    ${modifiersList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 15px 8px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">
                        Total:
                      </td>
                      <td style="padding: 15px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #eab308; border-top: 2px solid #e5e7eb;">
                        ${formattedTotal}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              ${data.notes ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <strong style="color: #92400e;">📝 Notas:</strong>
                <p style="margin: 10px 0 0 0; color: #78350f;">${data.notes}</p>
              </div>
              ` : ''}

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>💡 Próximos pasos:</strong> Tu reserva será revisada y confirmada pronto. 
                  Recibirás un email de confirmación cuando esté lista. Si necesitas modificar o cancelar tu reserva, 
                  contáctanos con al menos 24 horas de anticipación.
                </p>
              </div>

              <p style="font-size: 16px; margin-top: 30px;">
                ¡Esperamos verte pronto!
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Saludos,<br>
                <strong>${data.shopName}</strong>
              </p>
            </div>
          </body>
        </html>
      `

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ReservaFácil <onboarding@resend.dev>',
        to: data.customerEmail,
        subject: `📅 Reserva Recibida - ${data.shopName}`,
        html
      })

      console.log(`✅ Email de reserva creada enviado a ${data.customerEmail}`)
    } catch (error) {
      console.error('Error al enviar email de reserva creada:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Envía email de confirmación de reserva
   */
  async sendConfirmationEmail(data: BookingEmailData): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY no configurada, email no enviado')
        return
      }

      const formattedDate = this.formatDate(data.bookingDate)
      const formattedStartTime = this.formatTime(data.startTime)
      const formattedEndTime = this.formatTime(data.endTime)
      const formattedTotal = this.formatCurrency(data.totalPrice)

      const servicesList = data.services
        .map(
          (service) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${service.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${service.duration_minutes} min</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${this.formatCurrency(service.price)}</td>
        </tr>
      `
        )
        .join('')

      const modifiersList = (data.modifiers && data.modifiers.length > 0) ? data.modifiers
        .map(
          (modifier) => `
        <tr>
          <td style="padding: 8px 8px 8px 24px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">↳ ${modifier.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">${modifier.duration_modifier > 0 ? '+' : ''}${modifier.duration_modifier} min</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280; font-size: 14px;">${modifier.price_modifier > 0 ? '+' : ''}${this.formatCurrency(modifier.price_modifier)}</td>
        </tr>
      `
        )
        .join('') : ''

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reserva Confirmada</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Reserva Confirmada</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hola <strong>${data.customerName}</strong>,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Nos complace confirmar que tu reserva ha sido <strong style="color: #22c55e;">aceptada</strong>. 
                Estamos emocionados de atenderte.
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
                  📅 Detalles de tu Reserva
                </h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Fecha:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedDate}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Horario:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedStartTime} - ${formattedEndTime}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Duración:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.totalDuration} minutos</span>
                </div>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
                  🏪 Información del Negocio
                </h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Nombre:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopName}</span>
                </div>
                
                ${data.shopAddress ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Dirección:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopAddress}</span>
                </div>
                ` : ''}
                
                ${data.shopPhone ? `
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Teléfono:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopPhone}</span>
                </div>
                ` : ''}
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
                  🛠️ Servicios Reservados
                </h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Servicio</th>
                      <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Duración</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesList}
                    ${modifiersList}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 15px 8px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">
                        Total:
                      </td>
                      <td style="padding: 15px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #22c55e; border-top: 2px solid #e5e7eb;">
                        ${formattedTotal}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              ${data.notes ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <strong style="color: #92400e;">📝 Notas:</strong>
                <p style="margin: 10px 0 0 0; color: #78350f;">${data.notes}</p>
              </div>
              ` : ''}

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>💡 Recordatorio:</strong> Por favor, llega puntual a tu cita. 
                  Si necesitas modificar o cancelar tu reserva, contáctanos con al menos 24 horas de anticipación.
                </p>
              </div>

              <p style="font-size: 16px; margin-top: 30px;">
                ¡Esperamos verte pronto!
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Saludos,<br>
                <strong>${data.shopName}</strong>
              </p>
            </div>
          </body>
        </html>
      `

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ReservaFácil <onboarding@resend.dev>',
        to: data.customerEmail,
        subject: `✅ Reserva Confirmada - ${data.shopName}`,
        html
      })

      console.log(`✅ Email de confirmación enviado a ${data.customerEmail}`)
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Envía email de cancelación de reserva
   */
  async sendCancellationEmail(data: BookingEmailData): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY no configurada, email no enviado')
        return
      }

      const formattedDate = this.formatDate(data.bookingDate)
      const formattedStartTime = this.formatTime(data.startTime)
      const formattedEndTime = this.formatTime(data.endTime)

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reserva Cancelada</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">❌ Reserva Cancelada</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hola <strong>${data.customerName}</strong>,
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Lamentamos informarte que tu reserva ha sido <strong style="color: #ef4444;">cancelada</strong>.
              </p>

              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
                <h2 style="margin-top: 0; color: #991b1b; font-size: 20px;">
                  📅 Detalles de la Reserva Cancelada
                </h2>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Fecha:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedDate}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Horario:</strong>
                  <span style="margin-left: 10px; color: #111827;">${formattedStartTime} - ${formattedEndTime}</span>
                </div>
                
                <div style="margin: 15px 0;">
                  <strong style="color: #6b7280;">Negocio:</strong>
                  <span style="margin-left: 10px; color: #111827;">${data.shopName}</span>
                </div>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>💡 ¿Necesitas reagendar?</strong><br>
                  Si deseas realizar una nueva reserva, puedes contactarnos directamente o visitar nuestro sitio web.
                  Estaremos encantados de atenderte en otro momento.
                </p>
              </div>

              ${data.shopPhone ? `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; color: #6b7280;">
                  <strong>📞 Contacto:</strong> ${data.shopPhone}
                </p>
              </div>
              ` : ''}

              <p style="font-size: 16px; margin-top: 30px;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Saludos,<br>
                <strong>${data.shopName}</strong>
              </p>
            </div>
          </body>
        </html>
      `

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ReservaFácil <onboarding@resend.dev>',
        to: data.customerEmail,
        subject: `❌ Reserva Cancelada - ${data.shopName}`,
        html
      })

      console.log(`✅ Email de cancelación enviado a ${data.customerEmail}`)
    } catch (error) {
      console.error('Error al enviar email de cancelación:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }
}

