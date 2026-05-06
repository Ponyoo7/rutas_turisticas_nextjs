'use server'

import { defaultLocale, isLocale, LOCALE_COOKIE_NAME, Locale } from '@/shared/i18n/config'
import { cookies } from 'next/headers'

export const setLocale = async (locale: Locale) => {
  const cookieStore = await cookies()
  const nextLocale = isLocale(locale) ? locale : defaultLocale

  cookieStore.set({
    name: LOCALE_COOKIE_NAME,
    value: nextLocale,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
}
