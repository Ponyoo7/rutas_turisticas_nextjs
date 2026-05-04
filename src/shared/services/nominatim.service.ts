import { wait } from '@/lib/utils'
import { OSMAddress } from '../types/locations'

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search'
const ROUTECRAFT_USER_AGENT =
  'RouteCraft/1.0 (https://rutas-turisticas-nextjs.vercel.app; cqc1999@gmail.com)'
const NOMINATIM_RETRY_ATTEMPTS = 3
const NOMINATIM_RETRY_DELAY_MS = 1000
const NOMINATIM_RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

export const NOMINATIM_MIN_REMOTE_QUERY_LENGTH = 3
export const NOMINATIM_MAX_REMOTE_RESULTS = 10

type FeatureType = 'city' | 'settlement'

const buildApiHeaders = () => {
  const headers = new Headers()

  if (typeof window === 'undefined') {
    headers.set('User-Agent', ROUTECRAFT_USER_AGENT)
  }

  return headers
}

export const normalizeCitySearchQuery = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const clampSearchLimit = (limit: number) =>
  Math.max(1, Math.min(limit, NOMINATIM_MAX_REMOTE_RESULTS))

const buildSearchUrl = (
  query: string,
  limit: number,
  featureType: FeatureType,
) => {
  const searchParams = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    'accept-language': 'es',
    addressdetails: '0',
    dedupe: '1',
    layer: 'address',
    featureType,
    limit: String(limit),
  })

  return `${NOMINATIM_ENDPOINT}?${searchParams.toString()}`
}

const dedupeCities = (cities: OSMAddress[]) => {
  const uniqueCities = new Map<string, OSMAddress>()

  for (const city of cities) {
    const key = `${city.osm_type}-${city.osm_id}`

    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, city)
    }
  }

  return Array.from(uniqueCities.values())
}

const fetchNominatimResults = async (
  query: string,
  limit: number,
  featureType: FeatureType,
): Promise<OSMAddress[]> => {
  const endpoint = buildSearchUrl(query, clampSearchLimit(limit), featureType)

  for (let attempt = 0; attempt < NOMINATIM_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: buildApiHeaders(),
      })

      if (response.ok) {
        const data = (await response.json()) as unknown

        return Array.isArray(data) ? (data as OSMAddress[]) : []
      }

      if (
        NOMINATIM_RETRYABLE_STATUS_CODES.has(response.status) &&
        attempt < NOMINATIM_RETRY_ATTEMPTS - 1
      ) {
        await wait(NOMINATIM_RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      return []
    } catch {
      if (attempt < NOMINATIM_RETRY_ATTEMPTS - 1) {
        await wait(NOMINATIM_RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      return []
    }
  }

  return []
}

export const searchCitiesWithNominatim = async (
  query: string,
  limit = 8,
): Promise<OSMAddress[]> => {
  const trimmedQuery = query.trim()
  const normalizedQuery = normalizeCitySearchQuery(trimmedQuery)

  if (normalizedQuery.length < NOMINATIM_MIN_REMOTE_QUERY_LENGTH) {
    return []
  }

  const normalizedLimit = clampSearchLimit(limit)
  const cityMatches = await fetchNominatimResults(
    trimmedQuery,
    normalizedLimit,
    'city',
  )

  if (cityMatches.length > 0) {
    return cityMatches.slice(0, normalizedLimit)
  }

  const settlementMatches = await fetchNominatimResults(
    trimmedQuery,
    normalizedLimit,
    'settlement',
  )

  return dedupeCities([...cityMatches, ...settlementMatches]).slice(
    0,
    normalizedLimit,
  )
}
