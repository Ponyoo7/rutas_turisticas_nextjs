import { OSMElement } from './locations'

export interface CreateRoute {
  name: string
  places: OSMElement[]
  image: string
}

export interface Route {
  id: number
  user_id: string
  name: string
  places: OSMElement[]
  image: string
}
