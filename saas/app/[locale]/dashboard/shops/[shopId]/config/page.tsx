import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import ShopConfigPageClient from '@/components/shops/ShopConfigPageClient'
import type { Locale } from '@/lib/types/dictionary'

export default async function ShopConfigPage({
  params
}: {
  params: Promise<{ locale: string; shopId: string }>
}) {
  const { locale, shopId } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  const dict = await getDictionary(safeLocale)

  return (
    <ShopConfigPageClient
      shopId={shopId}
      locale={safeLocale}
      dict={dict}
    />
  )
}
