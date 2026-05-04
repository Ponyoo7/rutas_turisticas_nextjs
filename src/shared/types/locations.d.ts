export interface WikiData {
  title: string
  extract: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
  isMainCity?: boolean
}

export interface OSMAddress {
  place_id: number
  licence: string
  osm_type: 'node' | 'way' | 'relation'
  osm_id: number
  boundingbox: [string, string, string, string]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  addresstype: string
  name: string
  place_rank: number
}

export interface OSMElement {
  id: number
  type: 'node' | 'way' | 'relation'
  lat?: number
  lon?: number
  center?: {
    lat: number
    lon: number
  }
  tags: {
    name?: string
    tourism?: string
    historic?: string
    religion?: string
    website?: string
    description?: string
    wikipedia?: string
    wikipedia_image?: string
    image?: string
    wikimedia_commons?: string
    'wikimedia_commons:path'?: string
    addr_street?: string
    city?: string
    town?: string
    village?: string
    [key: string]: unknown
  }
  wikiInfo?: WikiData | null
}

export interface OverpassResponse {
  elements: OSMElement[]
}

export interface InterestPlacesByNameResult {
  coords: [number, number]
  places: OSMElement[]
  city: OSMAddress
  cityInfo?: WikiData | null
}

export interface MainCityData {
  cityInfo: WikiData
  city: OSMAddress
  coords: [number, number]
  places: OSMElement[]
}
