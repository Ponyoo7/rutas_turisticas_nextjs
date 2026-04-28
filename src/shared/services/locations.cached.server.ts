import 'server-only'

import { unstable_cache } from 'next/cache'
import { locationsService } from './locations.service'

const ONE_DAY_SECONDS = 60 * 60 * 24

export const getInterestPlacesByNameCached = unstable_cache(
  async (cityName: string) =>
    locationsService.getInterestPlacesByName(cityName),
  ['locations', 'interest-places-by-name'],
  { revalidate: ONE_DAY_SECONDS },
)

export const getInterestPlacesByCoordsCached = unstable_cache(
  async (lat: number, lon: number) =>
    locationsService.getInterestPlaces([lat, lon]),
  ['locations', 'interest-places-by-coords'],
  { revalidate: ONE_DAY_SECONDS },
)
