'use client'

import { setLocale } from '@/actions/locale.actions'
import { Locale } from '@/shared/i18n/config'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
]

interface LanguageSwitcherProps {
  compact?: boolean
}

export const LanguageSwitcher = ({
  compact = false,
}: LanguageSwitcherProps) => {
  const router = useRouter()
  const { locale, t } = useI18n()
  const [isPending, startTransition] = useTransition()

  const handleChangeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return

    startTransition(() => {
      void setLocale(nextLocale).then(() => {
        router.refresh()
      })
    })
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-artis-primary/10 bg-white/90 p-1 shadow-sm',
        compact ? 'text-xs' : 'text-sm',
      )}
      aria-label={t('common.language')}
    >
      {localeOptions.map((option) => {
        const isActive = option.value === locale

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChangeLocale(option.value)}
            disabled={isPending}
            className={cn(
              'rounded-full px-3 py-1.5 font-bold transition-colors',
              isActive
                ? 'bg-artis-primary text-white'
                : 'text-artis-primary/70 hover:bg-artis-primary/10',
            )}
            aria-pressed={isActive}
            aria-label={
              option.value === 'es' ? t('common.spanish') : t('common.english')
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
