import 'server-only'

import { unstable_cache } from 'next/cache'
import { OSMAddress } from '../types/locations'
import { InterestPlacesResponse } from '../types/interest-places'
import barcelonaPlaces from '../data/precomputed-interest-places/barcelona.json'
import londonPlaces from '../data/precomputed-interest-places/london.json'
import madridPlaces from '../data/precomputed-interest-places/madrid.json'
import parisPlaces from '../data/precomputed-interest-places/paris.json'
import romaPlaces from '../data/precomputed-interest-places/roma.json'
import {
  InterestPlacesCacheRecord,
  interestPlacesCacheStore,
} from './interest-places-cache.server'
import { locationsService, normalizeCityLookupKey } from './locations.service'

const INTEREST_PLACES_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const INTEREST_PLACES_PARTIAL_CACHE_TTL_MS = 1000 * 60 * 60 * 12
const INTEREST_PLACES_FALLBACK_CACHE_TTL_MS = 1000 * 60 * 15
const INTEREST_PLACES_EMPTY_CACHE_TTL_MS = 1000 * 60 * 5
const CITY_GEOCODER_REVALIDATE_SECONDS = 60 * 60 * 24 * 30
const LARGE_CITY_MIN_PRECOMPUTED_PLACES = 60

type PrecomputedCityPlaces = {
  aliases?: string[]
  city: string
  coords: number[]
  places: InterestPlacesResponse['places']
}

type ResolutionLog = {
  city: string
  source: InterestPlacesResponse['source']
  pois: number
  stale?: boolean
  usedPrecomputed?: boolean
  updatedCache?: boolean
  note?: string
}

const LARGE_CITY_KEYS = new Set([
  'madrid',
  'roma',
  'rome',
  'paris',
  'barcelona',
  'london',
  'londres',
])

const inflightInterestPlacesRequests = new Map<
  string,
  Promise<InterestPlacesResponse>
>()

const precomputedCityPlacesData: PrecomputedCityPlaces[] = [
  romaPlaces as PrecomputedCityPlaces,
  parisPlaces as PrecomputedCityPlaces,
  madridPlaces as PrecomputedCityPlaces,
  barcelonaPlaces as PrecomputedCityPlaces,
  londonPlaces as PrecomputedCityPlaces,
]

const precomputedCityPlacesByKey = new Map<string, PrecomputedCityPlaces>()

const getCityByNameCached = unstable_cache(
  async (cityName: string) => locationsService.getCityByName(cityName),
  ['locations', 'city-by-name', 'v1'],
  { revalidate: CITY_GEOCODER_REVALIDATE_SECONDS },
)

for (const entry of precomputedCityPlacesData) {
  const keys = [entry.city, ...(entry.aliases ?? [])]

  for (const key of keys) {
    precomputedCityPlacesByKey.set(normalizeCityCacheKey(key), entry)
  }
}

function logInterestPlacesResolution({
  city,
  source,
  pois,
  stale = false,
  usedPrecomputed = false,
  updatedCache = false,
  note,
}: ResolutionLog) {
  const suffix = note ? ` | ${note}` : ''

  console.info(
    `[InterestPlaces] city=${city} source=${source} pois=${pois} stale=${stale} usedPrecomputed=${usedPrecomputed} updatedCache=${updatedCache}${suffix}`,
  )
}

function normalizeCityCacheKey(cityName: string) {
  return normalizeCityLookupKey(cityName)
}

function isLargeCity(cityName: string) {
  return LARGE_CITY_KEYS.has(normalizeCityCacheKey(cityName))
}

function clonePayload(payload: InterestPlacesResponse): InterestPlacesResponse {
  return {
    ...payload,
    coords: payload.coords ? ([...payload.coords] as [number, number]) : null,
    places: [...payload.places],
  }
}

function toCoordsTuple(coords: number[] | null | undefined) {
  if (!Array.isArray(coords) || coords.length < 2) return null
  if (!Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return null

  return [coords[0], coords[1]] as [number, number]
}

function getCoordsFromCity(city: OSMAddress | null) {
  if (!city) return null

  return toCoordsTuple(locationsService.getCoordsByCity(city))
}

function getFallbackPayload(
  cityName: string,
  coords: [number, number] | null = null,
): InterestPlacesResponse {
  return {
    city: cityName,
    coords,
    places: [],
    source: 'fallback',
  }
}

async function getCachedEntry(cityKey: string) {
  return interestPlacesCacheStore.get(cityKey)
}

function getCachePayload(
  cacheRecord: InterestPlacesCacheRecord | null,
  options?: { forceStale?: boolean },
) {
  if (!cacheRecord) return null

  const isExpired = cacheRecord.expiresAt <= Date.now()
  const isFallbackPayload =
    cacheRecord.payload.source === 'fallback' ||
    cacheRecord.payload.places.length === 0

  return {
    ...clonePayload(cacheRecord.payload),
    source: isFallbackPayload ? ('fallback' as const) : ('cache' as const),
    stale: options?.forceStale ?? isExpired ? true : undefined,
  }
}

function getFreshCachePayload(cacheRecord: InterestPlacesCacheRecord | null) {
  if (!cacheRecord || cacheRecord.expiresAt <= Date.now()) {
    return null
  }

  return getCachePayload(cacheRecord, { forceStale: false })
}

function getStaleCachePayload(cacheRecord: InterestPlacesCacheRecord | null) {
  if (!cacheRecord) return null

  return getCachePayload(cacheRecord, { forceStale: true })
}

async function setInterestPlacesCache(
  cityKey: string,
  payload: InterestPlacesResponse,
) {
  const isEmptyFallback =
    payload.source === 'fallback' && payload.places.length === 0
  const isFallbackPayload =
    payload.source === 'fallback' && payload.places.length > 0
  const isOverpassPayload = payload.source === 'overpass'

  if (!isOverpassPayload && !isEmptyFallback && !isFallbackPayload) {
    return false
  }

  const existingRecord = await interestPlacesCacheStore.get(cityKey)
  const existingPlacesCount = existingRecord?.payload.places.length ?? 0

  if (isEmptyFallback && existingPlacesCount > 0) {
    return false
  }

  if (
    isFallbackPayload &&
    existingRecord?.payload.source === 'overpass' &&
    existingPlacesCount > 0
  ) {
    return false
  }

  if (
    isOverpassPayload &&
    existingPlacesCount > payload.places.length &&
    payload.places.length < 30
  ) {
    return false
  }

  const ttlMs = isEmptyFallback
    ? INTEREST_PLACES_EMPTY_CACHE_TTL_MS
    : isFallbackPayload
      ? INTEREST_PLACES_FALLBACK_CACHE_TTL_MS
    : payload.places.length >= 30
      ? INTEREST_PLACES_CACHE_TTL_MS
      : INTEREST_PLACES_PARTIAL_CACHE_TTL_MS

  await interestPlacesCacheStore.set(cityKey, {
    payload: clonePayload(payload),
    updatedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  })

  return true
}

function getPrecomputedCityPlaces(
  cityName: string,
  options?: {
    allowLowCoverage?: boolean
  },
): InterestPlacesResponse | null {
  const precomputed = precomputedCityPlacesByKey.get(
    normalizeCityCacheKey(cityName),
  )

  if (!precomputed) return null

  const coords = toCoordsTuple(precomputed.coords)

  if (!coords || precomputed.places.length === 0) return null

  const lowCoverageLargeCity =
    isLargeCity(cityName) &&
    precomputed.places.length < LARGE_CITY_MIN_PRECOMPUTED_PLACES

  if (lowCoverageLargeCity && !options?.allowLowCoverage) {
    return null
  }

  return {
    city: precomputed.city,
    coords,
    places: [...precomputed.places],
    source: 'fallback',
    stale: true,
  }
}

async function fetchInterestPlacesFromOrigin(
  cityName: string,
  cityKey: string,
): Promise<InterestPlacesResponse> {
  const result = await locationsService.getInterestPlacesByName(cityName)
  const payloadFromResult =
    result && result.places.length > 0
      ? ({
          city: result.city.name || cityName,
          coords: [...result.coords] as [number, number],
          places: result.places,
          source: result.source,
        } satisfies InterestPlacesResponse)
      : null

  if (payloadFromResult?.source === 'overpass') {
    const updatedCache = await setInterestPlacesCache(cityKey, payloadFromResult)

    logInterestPlacesResolution({
      city: payloadFromResult.city,
      source: payloadFromResult.source,
      pois: payloadFromResult.places.length,
      updatedCache,
      note: 'overpass',
    })

    return payloadFromResult
  }

  if (payloadFromResult) {
    const updatedCache = await setInterestPlacesCache(cityKey, payloadFromResult)

    logInterestPlacesResolution({
      city: payloadFromResult.city,
      source: payloadFromResult.source,
      pois: payloadFromResult.places.length,
      updatedCache,
      note: 'fallback-live',
    })

    return payloadFromResult
  }

  const precomputedFallback = getPrecomputedCityPlaces(cityName)

  if (precomputedFallback) {
    logInterestPlacesResolution({
      city: precomputedFallback.city,
      source: precomputedFallback.source,
      pois: precomputedFallback.places.length,
      stale: true,
      usedPrecomputed: true,
      note: 'fallback-precomputed',
    })

    return precomputedFallback
  }

  const fallbackPayload = getFallbackPayload(
    result?.city.name || cityName,
    result?.coords ? ([...result.coords] as [number, number]) : null,
  )
  const updatedCache = await setInterestPlacesCache(cityKey, fallbackPayload)

  logInterestPlacesResolution({
    city: fallbackPayload.city,
    source: fallbackPayload.source,
    pois: 0,
    stale: true,
    updatedCache,
    note: 'fallback-empty',
  })

  return fallbackPayload
}

function getOrCreateInterestPlacesRequest(cityName: string, cityKey: string) {
  const existingRequest = inflightInterestPlacesRequests.get(cityKey)

  if (existingRequest) return existingRequest

  const request = fetchInterestPlacesFromOrigin(cityName, cityKey).finally(() => {
    inflightInterestPlacesRequests.delete(cityKey)
  })

  inflightInterestPlacesRequests.set(cityKey, request)

  return request
}

function warmInterestPlacesInBackground(cityName: string, cityKey: string) {
  if (inflightInterestPlacesRequests.has(cityKey)) return

  void getOrCreateInterestPlacesRequest(cityName, cityKey)
}

export async function getInterestPlacesPayloadByCity(
  cityName: string,
): Promise<InterestPlacesResponse> {
  const normalizedCityName = cityName.trim()

  if (!normalizedCityName) return getFallbackPayload('')

  const cityKey = normalizeCityCacheKey(normalizedCityName)
  const cacheRecord = await getCachedEntry(cityKey)
  const freshCachePayload = getFreshCachePayload(cacheRecord)

  if (freshCachePayload) {
    logInterestPlacesResolution({
      city: freshCachePayload.city,
      source: freshCachePayload.source,
      pois: freshCachePayload.places.length,
      note: 'cache-hit',
    })

    return freshCachePayload
  }

  const staleCachePayload = getStaleCachePayload(cacheRecord)

  if (staleCachePayload) {
    logInterestPlacesResolution({
      city: staleCachePayload.city,
      source: staleCachePayload.source,
      pois: staleCachePayload.places.length,
      stale: true,
      note: 'cache-stale-hit',
    })
    warmInterestPlacesInBackground(normalizedCityName, cityKey)
    return staleCachePayload
  }

  return getOrCreateInterestPlacesRequest(normalizedCityName, cityKey)
}

export async function getCityMapSeed(
  cityName: string,
): Promise<InterestPlacesResponse> {
  const normalizedCityName = cityName.trim()

  if (!normalizedCityName) return getFallbackPayload('')

  const cityKey = normalizeCityCacheKey(normalizedCityName)
  const cacheRecord = await getCachedEntry(cityKey)
  const freshCachePayload = getFreshCachePayload(cacheRecord)

  if (freshCachePayload) {
    return freshCachePayload
  }

  const staleCachePayload = getStaleCachePayload(cacheRecord)

  if (staleCachePayload) {
    warmInterestPlacesInBackground(normalizedCityName, cityKey)
    return staleCachePayload
  }

  const precomputedSeed = getPrecomputedCityPlaces(normalizedCityName, {
    allowLowCoverage: true,
  })

  if (precomputedSeed) {
    logInterestPlacesResolution({
      city: precomputedSeed.city,
      source: precomputedSeed.source,
      pois: precomputedSeed.places.length,
      stale: true,
      usedPrecomputed: true,
      note: 'seed-precomputed',
    })

    return precomputedSeed
  }

  const city = await getCityByNameCached(normalizedCityName)

  return getFallbackPayload(normalizedCityName, getCoordsFromCity(city))
}

export async function getCachedCityByName(cityName: string) {
  return getCityByNameCached(cityName)
}

export { getPrecomputedCityPlaces, normalizeCityCacheKey }
