import 'server-only'

import { unstable_cache } from 'next/cache'
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

const getDefaultCitiesUncached = async (): Promise<WikiData[]> => {
  const cities = await Promise.all(
    defaultCityNames.map((cityName) =>
      locationsService.getWikiInfoByTitle(cityName, 'es'),
    ),
  )

  return cities.map(
    (city, index) => city ?? fallbackCity(defaultCityNames[index]),
  )
}

export const getDefaultCities = unstable_cache(
  getDefaultCitiesUncached,
  ['default-cities-v2'],
  {
    revalidate: 60 * 60 * 24,
    tags: ['default-cities-v2'],
  },
)
