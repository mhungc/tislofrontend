import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import { ShopsPageClient } from '@/components/shops/ShopsPageClient'
import type { Locale } from '@/lib/types/dictionary'

export default async function ShopsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  const dict = await getDictionary(safeLocale)

  return <ShopsPageClient locale={safeLocale} dict={dict} />
}

