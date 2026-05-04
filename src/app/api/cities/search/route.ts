import { wait } from '@/lib/utils'
import {
  NOMINATIM_MAX_REMOTE_RESULTS,
  NOMINATIM_MIN_REMOTE_QUERY_LENGTH,
  normalizeCitySearchQuery,
  searchCitiesWithNominatim,
} from '@/shared/services/nominatim.service'
import { OSMAddress } from '@/shared/types/locations'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SEARCH_CACHE_TTL_MS = 1000 * 60 * 60 * 24
const SEARCH_CACHE_MAX_ENTRIES = 250
const NOMINATIM_MIN_INTERVAL_MS = 1100
const BROWSER_CACHE_SECONDS = 60 * 5
const CDN_CACHE_SECONDS = 60 * 60 * 24
const STALE_WHILE_REVALIDATE_SECONDS = 60 * 60 * 24 * 7

type SearchCacheEntry = {
  data: OSMAddress[]
  expiresAt: number
}

const searchCache = new Map<string, SearchCacheEntry>()
const inFlightSearches = new Map<string, Promise<OSMAddress[]>>()

let requestQueue = Promise.resolve()
let lastUpstreamRequestAt = 0

const getResponseHeaders = () => ({
  'Cache-Control': `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${CDN_CACHE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
})

const clampSearchLimit = (value: number) =>
  Math.max(1, Math.min(value, NOMINATIM_MAX_REMOTE_RESULTS))

const getSearchCacheKey = (query: string, limit: number) =>
  `${normalizeCitySearchQuery(query)}:${clampSearchLimit(limit)}`

const pruneSearchCache = () => {
  const now = Date.now()

  for (const [key, entry] of searchCache.entries()) {
    if (entry.expiresAt <= now) {
      searchCache.delete(key)
    }
  }

  while (searchCache.size > SEARCH_CACHE_MAX_ENTRIES) {
    const oldestKey = searchCache.keys().next().value

    if (!oldestKey) {
      break
    }

    searchCache.delete(oldestKey)
  }
}

const getCachedSearchResult = (cacheKey: string) => {
  const cachedEntry = searchCache.get(cacheKey)

  if (!cachedEntry) {
    return null
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    searchCache.delete(cacheKey)
    return null
  }

  return cachedEntry.data
}

const setCachedSearchResult = (cacheKey: string, data: OSMAddress[]) => {
  searchCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
  })

  pruneSearchCache()
}

const scheduleUpstreamRequest = async <T>(task: () => Promise<T>) => {
  const nextRequest = requestQueue
    .catch(() => undefined)
    .then(async () => {
      const elapsedMs = Date.now() - lastUpstreamRequestAt
      const remainingDelayMs = Math.max(
        0,
        NOMINATIM_MIN_INTERVAL_MS - elapsedMs,
      )

      if (remainingDelayMs > 0) {
        await wait(remainingDelayMs)
      }

      lastUpstreamRequestAt = Date.now()

      return task()
    })

  requestQueue = nextRequest.then(
    () => undefined,
    () => undefined,
  )

  return nextRequest
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? '6')
  const limit = clampSearchLimit(limitParam)
  const normalizedQuery = normalizeCitySearchQuery(query)

  if (normalizedQuery.length < NOMINATIM_MIN_REMOTE_QUERY_LENGTH) {
    return NextResponse.json([], {
      headers: getResponseHeaders(),
    })
  }

  const cacheKey = getSearchCacheKey(query, limit)
  const cachedResult = getCachedSearchResult(cacheKey)

  if (cachedResult) {
    return NextResponse.json(cachedResult, {
      headers: getResponseHeaders(),
    })
  }

  const currentInFlightSearch = inFlightSearches.get(cacheKey)

  if (currentInFlightSearch) {
    const sharedResult = await currentInFlightSearch

    return NextResponse.json(sharedResult, {
      headers: getResponseHeaders(),
    })
  }

  const searchPromise = scheduleUpstreamRequest(() =>
    searchCitiesWithNominatim(query, limit),
  ).finally(() => {
    inFlightSearches.delete(cacheKey)
  })

  inFlightSearches.set(cacheKey, searchPromise)

  const result = await searchPromise

  setCachedSearchResult(cacheKey, result)

  return NextResponse.json(result, {
    headers: getResponseHeaders(),
  })
}
