import { getDictionary, isValidLocale } from '@/lib/dictionaries'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { DashboardProviders } from '@/components/providers/dashboard-providers'
import type { Locale } from '@/lib/types/dictionary'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  const dict = await getDictionary(safeLocale)

  return (
    <DashboardProviders>
      <DashboardShell locale={safeLocale} dict={dict}>
        {children}
      </DashboardShell>
    </DashboardProviders>
  )
}
