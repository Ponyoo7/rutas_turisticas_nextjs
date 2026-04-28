import { OSMElement } from './locations'
import { Route } from './routes'

export type InterestPlacesSource = 'cache' | 'overpass' | 'fallback'

export interface InterestPlacesResponse {
  city: string
  coords: [number, number] | null
  places: OSMElement[]
  source: InterestPlacesSource
  stale?: boolean
}

export interface CityVerifiedRouteMatch {
  route: Route
  matchingPlacesCount: number
}

export interface CityVerifiedRoutesResponse {
  city: string
  routes: CityVerifiedRouteMatch[]
  favoriteRouteIds: number[]
}
