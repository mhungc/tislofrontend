import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import { PublicBookingPageClient } from '@/components/booking/PublicBookingPageClient'
import type { Locale } from '@/lib/types/dictionary'

export default async function BookingPage({
  params
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  const dict = await getDictionary(safeLocale)

  return <PublicBookingPageClient token={token} locale={safeLocale} dict={dict} />
}
