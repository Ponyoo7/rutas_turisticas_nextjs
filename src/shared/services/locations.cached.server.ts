import 'server-only'

import { unstable_cache } from 'next/cache'
import {
  getCachedCityByName,
  getInterestPlacesPayloadByCity,
} from './interest-places.server'
import { locationsService } from './locations.service'

const ONE_DAY_SECONDS = 60 * 60 * 24
const OVERPASS_CACHE_VERSION = 'overpass-v3'

export const getInterestPlacesByNameCached = async (cityName: string) => {
  const [payload, city] = await Promise.all([
    getInterestPlacesPayloadByCity(cityName),
    getCachedCityByName(cityName),
  ])

  if (!city || !payload.coords) return null

  return {
    coords: payload.coords,
    places: payload.places,
    city,
    source: payload.source,
    stale: payload.stale,
  }
}

export const getInterestPlacesByCoordsCached = unstable_cache(
  async (lat: number, lon: number) =>
    locationsService.getInterestPlaces([lat, lon]),
  ['locations', 'interest-places-by-coords', OVERPASS_CACHE_VERSION],
  { revalidate: ONE_DAY_SECONDS },
)
