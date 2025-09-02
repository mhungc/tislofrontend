import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // Detect locale from referrer or accept-language header
  const referrer = request.headers.get('referer')
  const acceptLanguage = request.headers.get('accept-language')
  
  let locale = 'es' // default
  
  if (referrer && referrer.includes('/en/')) {
    locale = 'en'
  } else if (acceptLanguage && acceptLanguage.includes('en')) {
    locale = 'en'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/${locale}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/${locale}${next}`)
      } else {
        return NextResponse.redirect(`${origin}/${locale}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${locale}/auth/error`)
}