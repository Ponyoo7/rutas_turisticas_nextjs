'use client'

import { createContext, useContext } from 'react'
import { Locale } from './config'
import { translateMessage, TranslationTree, TranslationValues } from './core'

type I18nContextValue = {
  locale: Locale
  t: (key: string, values?: TranslationValues) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: React.ReactNode
  locale: Locale
  messages: TranslationTree
}

export const I18nProvider = ({
  children,
  locale,
  messages,
}: I18nProviderProps) => {
  return (
    <I18nContext.Provider
      value={{
        locale,
        t: (key, values) => translateMessage(messages, key, values),
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.')
  }

  return context
}
