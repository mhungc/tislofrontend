import { getDictionary } from '@/lib/dictionaries'
import { LandingPageLocalized } from '@/components/landing/LandingPageLocalized'
import type { Locale } from '@/lib/types/dictionary'

export default async function LocalePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const safeLocale: Locale = locale === 'en' ? 'en' : 'es'
  const dict = await getDictionary(safeLocale)
  
  return <LandingPageLocalized dict={dict} locale={safeLocale} />
}