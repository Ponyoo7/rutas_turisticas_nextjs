import { OSMElement } from '@/shared/types/locations'

const ROUTE_PLACE_TAG_KEYS = [
  'name',
  'tourism',
  'historic',
  'religion',
  'website',
  'description',
  'wikipedia',
  'wikipedia_image',
  'image',
  'wikimedia_commons',
  'wikimedia_commons:path',
  'addr_street',
  'city',
  'town',
  'village',
] as const

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const normalizeRoutePlaceTags = (
  tags: OSMElement['tags'] | undefined,
): OSMElement['tags'] => {
  const normalizedTags: OSMElement['tags'] = {}

  if (!tags || typeof tags !== 'object') return normalizedTags

  for (const key of ROUTE_PLACE_TAG_KEYS) {
    const value = tags[key]

    if (typeof value === 'string' && value.trim()) {
      normalizedTags[key] = value.trim()
    }
  }

  return normalizedTags
}

export const normalizeRoutePlaceForPersistence = (
  place: unknown,
): OSMElement | null => {
  if (!place || typeof place !== 'object') return null

  const candidate = place as Partial<OSMElement>
  const candidateId = candidate.id
  const candidateType = candidate.type

  if (typeof candidateId !== 'number' || !Number.isInteger(candidateId)) {
    return null
  }
  if (
    candidateType !== 'node' &&
    candidateType !== 'way' &&
    candidateType !== 'relation'
  ) {
    return null
  }

  const normalizedPlace: OSMElement = {
    id: candidateId,
    type: candidateType,
    tags: normalizeRoutePlaceTags(candidate.tags),
  }

  if (isFiniteNumber(candidate.lat)) {
    normalizedPlace.lat = candidate.lat
  }

  if (isFiniteNumber(candidate.lon)) {
    normalizedPlace.lon = candidate.lon
  }

  if (
    candidate.center &&
    isFiniteNumber(candidate.center.lat) &&
    isFiniteNumber(candidate.center.lon)
  ) {
    normalizedPlace.center = {
      lat: candidate.center.lat,
      lon: candidate.center.lon,
    }
  }

  return normalizedPlace
}

export const normalizeRoutePlacesForPersistence = (
  places: unknown,
): OSMElement[] => {
  if (!Array.isArray(places)) return []

  return places.filter(Boolean).flatMap((place) => {
    const normalizedPlace = normalizeRoutePlaceForPersistence(place)

    return normalizedPlace ? [normalizedPlace] : []
  })
}
