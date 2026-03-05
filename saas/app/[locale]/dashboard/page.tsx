import { getDictionary } from '@/lib/dictionaries'
import { PendingBookingsWidget } from '@/components/dashboard/PendingBookingsWidget'
import type { Locale } from '@/lib/types/dictionary'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale: Locale = locale === 'en' ? 'en' : 'es'
  const dict = await getDictionary(safeLocale)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{dict.dashboard.title}</h1>
        <p className="text-muted-foreground">{dict.dashboard.summary}</p>
      </div>

      {/* Widget de Reservas Pendientes */}
      <PendingBookingsWidget dict={dict.dashboard} common={dict.common} locale={safeLocale} />
    </div>
  )
}
