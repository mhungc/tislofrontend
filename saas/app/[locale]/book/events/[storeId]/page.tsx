import { PublicEventsBookingPageClient } from '@/components/events/PublicEventsBookingPageClient'
import { isValidLocale } from '@/lib/dictionaries'
import type { Locale } from '@/lib/types/dictionary'

export default async function LocalizedEventBookingPage({
  params
}: {
  params: Promise<{ locale: string; storeId: string }>
}) {
  const { locale, storeId } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'

  return <PublicEventsBookingPageClient storeId={storeId} locale={safeLocale} />
}