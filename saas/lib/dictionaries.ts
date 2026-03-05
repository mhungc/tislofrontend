import 'server-only'
import type { Dictionary, Locale } from './types/dictionary'

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default as Dictionary),
  es: () => import('../dictionaries/es.json').then((module) => module.default as Dictionary),
}

export const supportedLocales: Locale[] = ['es', 'en']

export const isValidLocale = (locale: string): locale is Locale => {
  return supportedLocales.includes(locale as Locale)
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'es'
  return dictionaries[safeLocale]()
}