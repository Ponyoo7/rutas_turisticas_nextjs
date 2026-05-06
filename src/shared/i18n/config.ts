import { messages } from './messages'

export const LOCALE_COOKIE_NAME = 'locale'

export const locales = ['es', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export const isLocale = (value: string | undefined | null): value is Locale =>
  locales.includes(value as Locale)

export const getMessagesByLocale = (locale: Locale) => messages[locale]
