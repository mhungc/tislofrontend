import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Locale } from '@/lib/types/dictionary'

function resolveLocaleFromRequest(cookieLocale?: string, acceptLanguage?: string): Locale {
  if (cookieLocale === 'en' || cookieLocale === 'es') {
    return cookieLocale
  }

  const normalized = (acceptLanguage || '').toLowerCase()
  if (normalized.includes('en')) {
    return 'en'
  }

  return 'es'
}

export default async function BookingPage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const cookieStore = await cookies()
  const headersStore = await headers()

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const acceptLanguage = headersStore.get('accept-language') || undefined
  const locale = resolveLocaleFromRequest(cookieLocale, acceptLanguage)

  redirect(`/${locale}/book/${token}`)
}
