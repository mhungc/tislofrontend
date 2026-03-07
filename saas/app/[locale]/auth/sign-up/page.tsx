import { UnifiedAuthForm } from "@/components/auth/UnifiedAuthForm";
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/types/dictionary';

export default async function SignUpPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const safeLocale: Locale = locale === 'en' ? 'en' : 'es';
  const dict = await getDictionary(safeLocale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <UnifiedAuthForm dict={dict} locale={safeLocale} />
    </div>
  );
}
