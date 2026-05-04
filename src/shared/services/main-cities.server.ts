import 'server-only'

import mainCitiesData from '../data/main-cities.json'
import { MainCityData } from '../types/locations'

const mainCities = mainCitiesData as unknown as MainCityData[]

const normalizeCityName = (value: string) =>
  value
    .split(',')[0]
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase() ?? ''

const mainCityByName = new Map<string, MainCityData>()

for (const mainCity of mainCities) {
  const candidates = [
    mainCity.cityInfo.title,
    mainCity.city.name,
    mainCity.city.display_name,
  ].filter((value): value is string => Boolean(value?.trim()))

  for (const candidate of candidates) {
    mainCityByName.set(normalizeCityName(candidate), mainCity)
  }
}

export const getMainCityDataByName = (name: string) =>
  mainCityByName.get(normalizeCityName(name)) ?? null
