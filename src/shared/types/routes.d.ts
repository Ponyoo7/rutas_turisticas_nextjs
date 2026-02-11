import { OSMElement } from "./locations"

export interface CreateRoute {
    name: string
    places: OSMElement[]
}