import 'server-only'

import defaultCitiesData from '../data/default-cities.json'
import { WikiData } from '../types/locations'

const defaultCities = defaultCitiesData as WikiData[]

export const defaultCityNames = defaultCities.map((city) => city.title)

export const getDefaultCities = async (): Promise<WikiData[]> => defaultCities
