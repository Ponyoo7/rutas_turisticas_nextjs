import 'server-only'

import { unstable_cache } from 'next/cache'
import { getMainCityDataByName } from './main-cities.server'
import { locationsService } from './locations.service'

const ONE_DAY_SECONDS = 60 * 60 * 24

export const getInterestPlacesByNameCached = unstable_cache(
  async (cityName: string) => {
    const mainCity = getMainCityDataByName(cityName)

    if (mainCity) {
      return {
        coords: mainCity.coords,
        places: mainCity.places,
        city: mainCity.city,
        cityInfo: mainCity.cityInfo,
      }
    }

    return locationsService.getInterestPlacesByName(cityName)
  },
  ['locations', 'interest-places-by-name'],
  { revalidate: ONE_DAY_SECONDS },
)

export const getInterestPlacesByCoordsCached = unstable_cache(
  async (lat: number, lon: number) =>
    locationsService.getInterestPlaces([lat, lon]),
  ['locations', 'interest-places-by-coords'],
  { revalidate: ONE_DAY_SECONDS },
)
