import { cache } from 'react'
import { locationsService } from '../services/locations.service'
import { WikiData } from '../types/locations'

export const defaultCityNames = [
  'Berlín',
  'Londres',
  'Nueva York',
  'Tokio',
  'Lisboa',
  'Roma',
  'Paris',
  'Estambul',
  'Madrid',
  'Valencia',
]

const FALLBACK_EXTRACT = 'Sin descripcion disponible.'
const fallbackCity = (name: string): WikiData => ({
  title: name,
  extract: FALLBACK_EXTRACT,
})

export const getDefaultCities = cache(async (): Promise<WikiData[]> => {
  const cities = await Promise.all(
    defaultCityNames.map((cityName) =>
      locationsService.getWikiInfoByTitle(cityName, 'es'),
    ),
  )

  return cities.map(
    (city, index) => city ?? fallbackCity(defaultCityNames[index]),
  )
})
