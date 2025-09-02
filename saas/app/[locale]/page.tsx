import { getDictionary } from '@/lib/dictionaries'
import { LandingPageLocalized } from '@/components/landing/LandingPageLocalized'

export default async function LocalePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as 'en' | 'es')
  
  return <LandingPageLocalized dict={dict} locale={locale} />
}