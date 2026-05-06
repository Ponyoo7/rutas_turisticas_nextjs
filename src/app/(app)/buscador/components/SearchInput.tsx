'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { Input } from '@/shared/components/ui/input'
import { useCitySearch } from '../context/useCitySearch'

export const SearchInput = () => {
  const { t } = useI18n()
  const { query, setQuery } = useCitySearch()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          {t('searchPage.prompt')}
        </h2>
        <div className="h-px w-full flex-1 bg-gray-200"></div>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('searchPage.placeholder')}
        className="h-14 rounded-xl border-artis-primary px-6 text-lg focus:ring-artis-primary focus:border-artis-primary"
      />
    </div>
  )
}
