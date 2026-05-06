'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { useCitySearch } from '../context/useCitySearch'
import { CityCard } from './CityCard'

export const CityList = () => {
  const { t } = useI18n()
  const { filteredCities, query } = useCitySearch()

  if (!filteredCities.length) {
    return <p>{t('searchPage.noResults', { query })}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredCities.map((city, index) => (
        <CityCard key={`${city.title}-${index}`} city={city} />
      ))}
    </div>
  )
}
