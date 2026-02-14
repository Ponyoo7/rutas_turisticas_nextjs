'use client'

import { useCitySearch } from '../context/useCitySearch'
import { CityCard } from './CityCard'

export const CityList = () => {
  const { filteredCities, query } = useCitySearch()

  if (!filteredCities.length) {
    return <p>No hay resultados para {query}.</p>
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {filteredCities.map((city, index) => (
        <CityCard key={`${city.title}-${index}`} city={city} />
      ))}
    </div>
  )
}
