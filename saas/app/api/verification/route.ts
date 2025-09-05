import { NextRequest, NextResponse } from 'next/server'
import { VerificationService } from '@/lib/services/verification-service'

// Rate limiting simple (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hora
  const maxRequests = 5

  const current = rateLimitMap.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown'
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta en 1 hora.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const verificationService = new VerificationService()
    await verificationService.sendVerificationCode(email)

    return NextResponse.json({
      message: 'Código enviado correctamente',
      success: true
    })

  } catch (error) {
    console.error('Error sending verification:', error)
    return NextResponse.json(
      { error: 'Error al enviar código de verificación' },
      { status: 500 }
    )
  }
}