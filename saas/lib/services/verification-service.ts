import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

export class VerificationService {
  private resend = new Resend(process.env.RESEND_API_KEY)

  // Generar código de 6 dígitos
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Enviar código de verificación
  async sendVerificationCode(email: string): Promise<string> {
    try {
      const code = this.generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

      console.log('Generating verification code for:', email)

      // Limpiar códigos anteriores del mismo email
      await prisma.verification_codes.deleteMany({
        where: { email }
      })

      // Crear nuevo código
      await prisma.verification_codes.create({
        data: {
          email,
          code,
          expires_at: expiresAt
        }
      })

      console.log('Verification code saved to database:', code)

      // LOG TEMPORAL PARA DEBUG - REMOVER EN PRODUCCIÓN
      console.log(`🔑 CÓDIGO DE VERIFICACIÓN PARA ${email}: ${code}`)
      
      // Enviar email
      try {
        if (process.env.RESEND_API_KEY) {
          console.log('Sending email with Resend...')
          const result = await this.resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'ReservaFácil <onboarding@resend.dev>',
            to: email,
            subject: 'Código de verificación - ReservaFácil',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Código de verificación</h2>
                <p>Tu código de verificación es:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
                  ${code}
                </div>
                <p>Este código expira en 10 minutos.</p>
              </div>
            `
          })
          console.log('Email sent successfully:', result)
        } else {
          console.log('⚠️ RESEND_API_KEY no configurada, solo mostrando código en consola')
        }
      } catch (error) {
        console.error('Error sending email:', error)
        // No fallar si el email falla, solo mostrar en consola
      }

      return code
    } catch (error) {
      console.error('Error in sendVerificationCode:', error)
      throw error
    }
  }

  // Verificar código
  async verifyCode(email: string, code: string): Promise<boolean> {
    const verification = await prisma.verification_codes.findFirst({
      where: {
        email,
        code,
        used: false,
        expires_at: {
          gt: new Date()
        }
      }
    })

    if (!verification) {
      return false
    }

    // Marcar como usado
    await prisma.verification_codes.update({
      where: { id: verification.id },
      data: { used: true }
    })

    return true
  }

  // Limpiar códigos expirados (tarea de mantenimiento)
  async cleanExpiredCodes(): Promise<void> {
    await prisma.verification_codes.deleteMany({
      where: {
        expires_at: {
          lt: new Date()
        }
      }
    })
  }
}