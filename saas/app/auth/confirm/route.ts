import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // Detect locale from referrer or accept-language header
  const referrer = request.headers.get('referer')
  const acceptLanguage = request.headers.get('accept-language')
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  
  let locale = 'es' // default
  
  if (cookieLocale === 'en' || cookieLocale === 'es') {
    locale = cookieLocale
  } else if (referrer && referrer.includes('/en/')) {
    locale = 'en'
  } else if (acceptLanguage && acceptLanguage.includes('en')) {
    locale = 'en'
  }

  const normalizedNext = next.startsWith('/') ? next : `/${next}`
  const nextHasLocale = /^\/(en|es)(\/|$)/.test(normalizedNext)
  const redirectPath = nextHasLocale ? normalizedNext : `/${locale}${normalizedNext}`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${locale}/auth/error`)
}