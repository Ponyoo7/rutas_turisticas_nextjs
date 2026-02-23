'use client'

import { useCitySearch } from '../context/useCitySearch'
import { CityCard } from './CityCard'

/**
 * Componente que renderiza una cuadrícula (grid) con las tarjetas de las ciudades (`CityCard`).
 * Obtiene las ciudades filtradas directamente desde el contexto de búsqueda (`useCitySearch`).
 */
export const CityList = () => {
  const { filteredCities, query } = useCitySearch()

  if (!filteredCities.length) {
    return <p>No hay resultados para {query}.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredCities.map((city, index) => (
        <CityCard key={`${city.title}-${index}`} city={city} />
      ))}
    </div>
  )
}
