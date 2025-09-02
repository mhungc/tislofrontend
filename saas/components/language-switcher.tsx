'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]

  const switchLanguage = (newLocale: string) => {
    // Replace current locale with new one
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Button
        variant={currentLocale === 'es' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('es')}
        className="text-sm"
      >
        ES
      </Button>
      <Button
        variant={currentLocale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLanguage('en')}
        className="text-sm"
      >
        EN
      </Button>
    </div>
  )
}