import { cookies } from 'next/headers'
import { defaultLocale, getMessagesByLocale, isLocale, LOCALE_COOKIE_NAME, Locale } from './config'
import { translateMessage, TranslationValues } from './core'

export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  return isLocale(locale) ? locale : defaultLocale
}

export const getTranslations = async (locale?: Locale) => {
  const resolvedLocale = locale ?? (await getLocale())
  const messages = getMessagesByLocale(resolvedLocale)

  return {
    locale: resolvedLocale,
    messages,
    t: (key: string, values?: TranslationValues) =>
      translateMessage(messages, key, values),
  }
}
