import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import { ShopSchedulePageClient } from '@/components/schedule/ShopSchedulePageClient'
import type { Locale } from '@/lib/types/dictionary'

export default async function ShopSchedulePage({
  params
}: {
  params: Promise<{ locale: string; shopId: string }>
}) {
  const { locale, shopId } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  const dict = await getDictionary(safeLocale)

  return (
    <ShopSchedulePageClient
      shopId={shopId}
      locale={safeLocale}
      dict={dict}
    />
  )
}