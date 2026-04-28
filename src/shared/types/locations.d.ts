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
    amenity?: string
    leisure?: string
    building?: string
    place?: string
    man_made?: string
    religion?: string
    website?: string
    description?: string
    wikipedia?: string
    wikidata?: string
    image?: string
    wikipedia_image?: string
    wikimedia_commons?: string
    'wikimedia_commons:path'?: string
    [key: string]: unknown
  }
}

export interface OverpassResponse {
  elements: OSMElement[]
}

export interface WikiData {
  title: string
  extract: string
  thumbnail?: {
    source: string
    width?: number
    height?: number
  }
  heroImage?: {
    source: string
    width?: number
    height?: number
  }
}
