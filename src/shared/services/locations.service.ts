import { wait } from '@/lib/utils'
import {
  OSMAddress,
  OSMElement,
  OverpassResponse,
  WikiData,
} from '../types/locations'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

const OVERPASS_TOTAL_BUDGET_MS = 13_500
const OVERPASS_SERVER_TIMEOUT_SECONDS = 35
const OVERPASS_CLIENT_TIMEOUT_MS = 12000
const OVERPASS_REQUEST_RETRIES = 0
const OVERPASS_RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const OVERPASS_RATE_LIMIT_COOLDOWN_MS = 60_000
const OVERPASS_RESULT_LIMIT = 350
const OVERPASS_ACCEPTABLE_RESULTS = 30
const OVERPASS_SUFFICIENT_RESULTS = 80
const OVERPASS_SMALL_CITY_ACCEPTABLE_RESULTS = 20
const OVERPASS_SMALL_CITY_SUFFICIENT_RESULTS = 40
const OVERPASS_ENRICHED_PHASE_TIMEOUT_MS = 4200
const OVERPASS_BROAD_PHASE_TIMEOUT_MS = 3200
const OVERPASS_CORE_PHASE_TIMEOUT_MS = 2200
const OVERPASS_MIN_PHASE_BUDGET_MS = 900
const OVERPASS_ENDPOINT_BATCH_SIZE = 2
const OVERPASS_CITY_RADIUS_STEPS = {
  large: [3000, 1800, 1000],
  medium: [1800, 1000],
  small: [1200, 800],
} as const
const NOMINATIM_RESCUE_REQUEST_TIMEOUT_MS = 1800
const NOMINATIM_RESCUE_MIN_TIME_LEFT_MS = 1600
const NOMINATIM_RESCUE_LIMIT = 6
const NOMINATIM_RESCUE_SEARCH_TERMS = [
  'museum',
  'tourist attraction',
  'gallery',
  'monument',
  'church',
  'theatre',
  'park',
  'square',
  'palace',
] as const
const WIKI_RETRY_DELAY_MS = 600
const WIKI_RETRY_ATTEMPTS = 3
const WIKI_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const OVERPASS_CORE_CATEGORY_FILTERS = [
  {
    key: 'tourism',
    values: 'museum|attraction|gallery|viewpoint',
  },
  {
    key: 'historic',
    values: 'monument|memorial|castle|archaeological_site|ruins|palace',
  },
  {
    key: 'amenity',
    values: 'place_of_worship|theatre|arts_centre|fountain',
  },
  {
    key: 'leisure',
    values: 'park|garden',
  },
  {
    key: 'place',
    values: 'square',
  },
  {
    key: 'man_made',
    values: 'tower',
  },
  {
    key: 'building',
    values: 'church|cathedral|mosque|palace',
  },
] as const
const OVERPASS_BROAD_CATEGORY_FILTERS = [
  ...OVERPASS_CORE_CATEGORY_FILTERS,
  {
    key: 'tourism',
    values: 'artwork|zoo|aquarium',
  },
  {
    key: 'historic',
    values: 'church|city_gate',
  },
  {
    key: 'amenity',
    values: 'marketplace',
  },
] as const
const OVERPASS_ELEMENT_TYPES = ['node', 'way', 'relation'] as const
const OVERPASS_ENRICHED_TAGS = ['wikidata', 'wikipedia', 'heritage'] as const
const CITY_ALIAS_GROUPS = [
  {
    canonicalKey: 'istanbul',
    queryName: 'Istanbul',
    aliases: ['istanbul', 'estambul'],
  },
  {
    canonicalKey: 'munich',
    queryName: 'Munich',
    aliases: ['munich', 'munchen', 'muenchen'],
  },
  {
    canonicalKey: 'cologne',
    queryName: 'Cologne',
    aliases: ['cologne', 'colonia', 'koln'],
  },
  {
    canonicalKey: 'rome',
    queryName: 'Rome',
    aliases: ['rome', 'roma'],
  },
  {
    canonicalKey: 'london',
    queryName: 'London',
    aliases: ['london', 'londres'],
  },
  {
    canonicalKey: 'paris',
    queryName: 'Paris',
    aliases: ['paris'],
  },
  {
    canonicalKey: 'madrid',
    queryName: 'Madrid',
    aliases: ['madrid'],
  },
  {
    canonicalKey: 'barcelona',
    queryName: 'Barcelona',
    aliases: ['barcelona'],
  },
] as const
const CITY_ALIAS_LOOKUP = new Map<string, string>()
const CITY_CANONICAL_QUERY_NAMES = new Map<string, string>()
const OVERPASS_LARGE_CITY_KEYS = new Set([
  'madrid',
  'rome',
  'paris',
  'barcelona',
  'london',
  'istanbul',
])
const IMAGE_EXTENSION_REGEX =
  /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i
const COMMONS_FILE_PATH_PREFIX =
  'https://commons.wikimedia.org/wiki/Special:FilePath/'
const WIKI_IMAGE_PROXY_PATH = '/api/wiki-image'
const ROUTECRAFT_USER_AGENT = 'RouteCraft/1.0 (contacto: cqc1999@gmail.com)'
const ROUTECRAFT_REFERER = 'https://rutas-turisticas-nextjs.vercel.app/'

type OverpassQueryMode = 'enriched' | 'broad' | 'core'
type OverpassCitySize = keyof typeof OVERPASS_CITY_RADIUS_STEPS
type OverpassCategoryFilter = {
  key: string
  values: string
}
type OverpassCityContext = {
  cityLabel: string
  cityKey: string
  size: OverpassCitySize
  radii: readonly number[]
  acceptableResults: number
  sufficientResults: number
  boundingBoxSpanKm: number | null
}
type OverpassQueryPlan = {
  mode: OverpassQueryMode
  radiusMeters: number
  targetResults: number
}
type OverpassFetchSuccess = {
  ok: true
  endpoint: string
  mode: OverpassQueryMode
  radiusMeters: number
  durationMs: number
  places: OSMElement[]
}
type OverpassFetchFailure = {
  ok: false
  endpoint: string
  mode: OverpassQueryMode
  radiusMeters: number
  durationMs: number
  reason: string
}
type OverpassFetchResult = OverpassFetchSuccess | OverpassFetchFailure
type OverpassPhaseResult = {
  places: OSMElement[]
  endpoint: string | null
  mode: OverpassQueryMode
  radiusMeters: number
}
type NominatimPlaceSearchResult = {
  osm_id: number
  osm_type: 'node' | 'way' | 'relation'
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  name?: string
}

interface WikiSummaryResponse {
  title?: string
  extract?: string
  thumbnail?: WikiData['thumbnail']
  originalimage?: WikiData['heroImage']
}

interface WikiLangLinksResponse {
  query?: {
    pages?: Record<
      string,
      {
        langlinks?: Array<{
          '*': string
        }>
      }
    >
  }
}

const wikiInfoByTitleCache = new Map<string, Promise<WikiData | null>>()
const wikiInfoCache = new Map<string, Promise<WikiData | null>>()
const spanishTitleCache = new Map<string, Promise<string | null>>()
const overpassEndpointCooldowns = new Map<string, number>()

const normalizeBaseCityValue = (value?: string | null) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')

for (const group of CITY_ALIAS_GROUPS) {
  CITY_CANONICAL_QUERY_NAMES.set(group.canonicalKey, group.queryName)

  for (const alias of group.aliases) {
    CITY_ALIAS_LOOKUP.set(normalizeBaseCityValue(alias), group.canonicalKey)
  }
}

export const normalizeCityLookupKey = (value?: string | null) => {
  const normalizedValue = normalizeBaseCityValue(value)

  return CITY_ALIAS_LOOKUP.get(normalizedValue) ?? normalizedValue
}

const getCanonicalCityQueryName = (value?: string | null) => {
  const normalizedValue = normalizeCityLookupKey(value)

  return CITY_CANONICAL_QUERY_NAMES.get(normalizedValue) ?? value?.trim() ?? ''
}

const buildApiHeaders = (options?: {
  accept?: string
  contentType?: string
  includeReferer?: boolean
}) => {
  const headers = new Headers()

  if (options?.accept) {
    headers.set('Accept', options.accept)
  }

  if (options?.contentType) {
    headers.set('Content-Type', options.contentType)
  }

  if (typeof window === 'undefined') {
    headers.set('User-Agent', ROUTECRAFT_USER_AGENT)

    if (options?.includeReferer ?? true) {
      headers.set('Referer', ROUTECRAFT_REFERER)
    }
  }

  return headers
}

const buildOverpassHeaders = () =>
  buildApiHeaders({
    accept: 'application/json',
    contentType: 'text/plain; charset=UTF-8',
    includeReferer: false,
  })

const getRetryAfterDelayMs = (retryAfterHeader: string | null) => {
  if (!retryAfterHeader) return null

  const retryAfterSeconds = Number(retryAfterHeader)

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return retryAfterSeconds * 1000
  }

  const retryAfterDateMs = Date.parse(retryAfterHeader)

  if (Number.isNaN(retryAfterDateMs)) return null

  return Math.max(0, retryAfterDateMs - Date.now())
}

const getOverpassCooldownMs = (endpoint: string) => {
  const blockedUntil = overpassEndpointCooldowns.get(endpoint)

  if (!blockedUntil) return 0

  const remainingMs = blockedUntil - Date.now()

  if (remainingMs <= 0) {
    overpassEndpointCooldowns.delete(endpoint)
    return 0
  }

  return remainingMs
}

const markOverpassEndpointCooldown = (endpoint: string, cooldownMs: number) => {
  overpassEndpointCooldowns.set(endpoint, Date.now() + cooldownMs)
}

const getOverpassEndpointsForCoords = () => {
  const availableEndpoints = OVERPASS_ENDPOINTS.filter(
    (endpoint) => getOverpassCooldownMs(endpoint) <= 0,
  )

  return availableEndpoints.length > 0 ? availableEndpoints : OVERPASS_ENDPOINTS
}

const memoizeAsync = <T>(
  cache: Map<string, Promise<T>>,
  key: string,
  factory: () => Promise<T>,
) => {
  const cached = cache.get(key)

  if (cached) return cached

  const promise = factory()
    .then((result) => {
      if (result == null) {
        cache.delete(key)
      }

      return result
    })
    .catch((error) => {
      cache.delete(key)
      throw error
    })

  cache.set(key, promise)

  return promise
}

const normalizeWikiTitle = (title: string) => title.trim().replace(/_/g, ' ')

const buildWikiCacheKey = (lang: string, title: string) =>
  `${lang.toLowerCase()}:${normalizeWikiTitle(title).toLowerCase()}`

const ensureHttps = (url: string) =>
  url.startsWith('//') ? `https:${url}` : url.replace(/^http:\/\//i, 'https://')

const safelyDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const buildCommonsFilePathUrl = (fileName: string) => {
  const normalizedFileName = safelyDecodeURIComponent(fileName)
    .replace(/^File:/i, '')
    .trim()

  if (!normalizedFileName) return null

  return `${COMMONS_FILE_PATH_PREFIX}${encodeURIComponent(normalizedFileName)}`
}

const extractProxyImageUrl = (urlLike: string) => {
  try {
    const url = urlLike.startsWith('http://') || urlLike.startsWith('https://')
      ? new URL(urlLike)
      : new URL(urlLike, 'https://routecraft.local')

    if (url.pathname !== WIKI_IMAGE_PROXY_PATH) return null

    const proxiedUrl = url.searchParams.get('url')

    return proxiedUrl ? safelyDecodeURIComponent(proxiedUrl) : null
  } catch {
    return null
  }
}

const extractCommonsFileNameFromUrl = (urlLike: string) => {
  try {
    const url = new URL(ensureHttps(urlLike))
    const specialFileMatch = url.pathname.match(
      /^\/wiki\/Special:(?:FilePath|Redirect\/file)\/(.+)$/i,
    )

    if (specialFileMatch) {
      return safelyDecodeURIComponent(specialFileMatch[1]).trim()
    }

    const filePageMatch = url.pathname.match(/^\/wiki\/File:(.+)$/i)

    if (!filePageMatch) return null

    return safelyDecodeURIComponent(filePageMatch[1]).trim()
  } catch {
    return null
  }
}

const shouldProxyWikiImage = (urlLike: string) => {
  try {
    const url = new URL(ensureHttps(urlLike))

    return (
      url.hostname === 'upload.wikimedia.org' ||
      url.hostname === 'commons.wikimedia.org'
    )
  } catch {
    return false
  }
}

const normalizeCanonicalImageUrl = (source?: string | null) => {
  if (typeof source !== 'string') return null

  const trimmedSource = source.trim()

  if (!trimmedSource || /^Category:/i.test(trimmedSource)) return null

  const proxiedSource = extractProxyImageUrl(trimmedSource)

  if (proxiedSource) {
    return normalizeCanonicalImageUrl(proxiedSource)
  }

  if (trimmedSource.startsWith('/')) {
    return trimmedSource
  }

  const commonsFileName = extractCommonsFileNameFromUrl(trimmedSource)

  if (commonsFileName) {
    return buildCommonsFilePathUrl(commonsFileName)
  }

  if (/^File:/i.test(trimmedSource)) {
    return buildCommonsFilePathUrl(trimmedSource)
  }

  const normalizedUrl = ensureHttps(trimmedSource)

  if (/^https?:\/\/upload\.wikimedia\.org\//i.test(normalizedUrl)) {
    return normalizedUrl
  }

  try {
    const url = new URL(normalizedUrl)

    if (IMAGE_EXTENSION_REGEX.test(url.pathname)) {
      return normalizedUrl
    }
  } catch {
    return null
  }

  return null
}

const toRenderableImageUrl = (source?: string | null) => {
  const canonicalSource = normalizeCanonicalImageUrl(source)

  if (!canonicalSource) return null
  if (canonicalSource.startsWith('/')) return canonicalSource

  return shouldProxyWikiImage(canonicalSource)
    ? `${WIKI_IMAGE_PROXY_PATH}?url=${encodeURIComponent(canonicalSource)}`
    : canonicalSource
}

const normalizeWikiImageAsset = <
  T extends WikiData['thumbnail'] | WikiData['heroImage'],
>(
  image?: T,
) => {
  const normalizedSource = normalizeCanonicalImageUrl(image?.source)

  if (!normalizedSource || !image) return undefined

  return {
    ...image,
    source: normalizedSource,
  }
}

const getSummaryThumbnail = (data: WikiSummaryResponse) =>
  normalizeWikiImageAsset(data.thumbnail) ??
  normalizeWikiImageAsset(data.originalimage)

const getSummaryHeroImage = (data: WikiSummaryResponse) =>
  normalizeWikiImageAsset(data.originalimage) ??
  normalizeWikiImageAsset(data.thumbnail)

const fetchWikipediaJson = async <T>(endpoint: string): Promise<T | null> => {
  for (let attempt = 0; attempt < WIKI_RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(endpoint, {
        headers: buildApiHeaders(),
      })

      if (res.ok) {
        return (await res.json()) as T
      }

      if (res.status === 404) return null

      if (
        WIKI_RETRYABLE_STATUS_CODES.has(res.status) &&
        attempt < WIKI_RETRY_ATTEMPTS - 1
      ) {
        await wait(WIKI_RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      console.warn(`Wikipedia API responded with ${res.status}: ${endpoint}`)
      return null
    } catch (error) {
      if (attempt < WIKI_RETRY_ATTEMPTS - 1) {
        await wait(WIKI_RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      console.error('Error en Wikipedia API:', error)
      return null
    }
  }

  return null
}

const splitWikiTag = (wikiTag: string) => {
  const separatorIndex = wikiTag.indexOf(':')

  if (separatorIndex === -1) {
    return ['en', normalizeWikiTitle(wikiTag)] as const
  }

  return [
    wikiTag.slice(0, separatorIndex).trim().toLowerCase(),
    normalizeWikiTitle(wikiTag.slice(separatorIndex + 1)),
  ] as const
}

const getCitiesByName = async (
  name: string,
  limit = 8,
): Promise<OSMAddress[]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        name,
      )}&limit=${limit}&accept-language=es`,
      {
        headers: buildApiHeaders(),
      },
    )
    const dataJson = await res.json()

    return Array.isArray(dataJson) ? dataJson : []
  } catch (e) {
    console.log(e)

    return []
  }
}

const getCityByName = async (name: string): Promise<OSMAddress | null> => {
  const trimmedName = name.trim()
  const queryCandidates = [
    trimmedName,
    getCanonicalCityQueryName(trimmedName),
  ].filter((candidate, index, list) => candidate && list.indexOf(candidate) === index)

  for (const candidate of queryCandidates) {
    const cities = await getCitiesByName(candidate, 1)

    if (cities[0]) {
      return cities[0]
    }
  }

  return null
}

const getCoordsByCity = (city: OSMAddress): number[] => {
  return [parseFloat(city.lat), parseFloat(city.lon)]
}

const parseBoundingBoxSpanKm = (boundingBox?: OSMAddress['boundingbox']) => {
  if (!boundingBox || boundingBox.length < 4) return null

  const [south, north, west, east] = boundingBox.map((value) => Number(value))

  if ([south, north, west, east].some((value) => Number.isNaN(value))) {
    return null
  }

  const centerLatRadians = (((south + north) / 2) * Math.PI) / 180
  const latSpanKm = Math.abs(north - south) * 111.32
  const lonSpanKm =
    Math.abs(east - west) * 111.32 * Math.max(Math.cos(centerLatRadians), 0.2)

  return Math.max(latSpanKm, lonSpanKm)
}

const getOverpassCityContext = (
  cityName?: string,
  city?: OSMAddress | null,
): OverpassCityContext => {
  const cityLabel = city?.name || cityName?.trim() || 'unknown'
  const cityKey = normalizeCityLookupKey(cityLabel)
  const boundingBoxSpanKm = parseBoundingBoxSpanKm(city?.boundingbox)
  const importance = city?.importance ?? 0
  let size: OverpassCitySize = 'small'

  if (
    OVERPASS_LARGE_CITY_KEYS.has(cityKey) ||
    importance >= 0.75 ||
    (boundingBoxSpanKm != null && boundingBoxSpanKm >= 18)
  ) {
    size = 'large'
  } else if (
    importance >= 0.45 ||
    (boundingBoxSpanKm != null && boundingBoxSpanKm >= 8)
  ) {
    size = 'medium'
  } else if (!city && !cityName) {
    size = 'medium'
  }

  return {
    cityLabel,
    cityKey,
    size,
    radii: OVERPASS_CITY_RADIUS_STEPS[size],
    acceptableResults:
      size === 'small'
        ? OVERPASS_SMALL_CITY_ACCEPTABLE_RESULTS
        : OVERPASS_ACCEPTABLE_RESULTS,
    sufficientResults:
      size === 'small'
        ? OVERPASS_SMALL_CITY_SUFFICIENT_RESULTS
        : OVERPASS_SUFFICIENT_RESULTS,
    boundingBoxSpanKm,
  }
}

const buildBoundingBoxFromRadius = (
  [lat, lon]: number[],
  radiusMeters: number,
) => {
  const latDelta = radiusMeters / 111_320
  const lonDelta =
    radiusMeters /
    (111_320 * Math.max(Math.cos((lat * Math.PI) / 180), 0.2))

  return {
    south: lat - latDelta,
    north: lat + latDelta,
    west: lon - lonDelta,
    east: lon + lonDelta,
  }
}

const getNominatimViewBox = (
  coords: number[],
  city?: OSMAddress | null,
  cityContext?: OverpassCityContext,
) => {
  const boundingBox = city?.boundingbox

  if (boundingBox?.length === 4) {
    const [south, north, west, east] = boundingBox.map((value) => Number(value))

    if ([south, north, west, east].every((value) => Number.isFinite(value))) {
      return {
        south,
        north,
        west,
        east,
      }
    }
  }

  const fallbackRadius =
    cityContext?.radii[cityContext.radii.length - 1] ?? 1000

  return buildBoundingBoxFromRadius(coords, fallbackRadius)
}

const getInterestPlaceDedupeKey = (place: OSMElement) => {
  const wikidata = place.tags.wikidata?.trim()

  if (wikidata) return `wikidata:${wikidata}`

  const wikipedia = place.tags.wikipedia?.trim().toLowerCase()

  if (wikipedia) return `wikipedia:${wikipedia}`

  return `${place.type}:${place.id}`
}

const getInterestPlaceScore = (place: OSMElement) => {
  let score = 0

  if (place.tags.wikidata) score += 4
  if (place.tags.wikipedia) score += 3
  if (place.tags.website) score += 2
  if (place.tags.image || place.tags.wikipedia_image) score += 1
  if (place.lat != null && place.lon != null) score += 1
  if (place.center?.lat != null && place.center?.lon != null) score += 1

  return score
}

const dedupeInterestPlaces = (places: OSMElement[]) => {
  const placesByKey = new Map<string, OSMElement>()

  for (const place of places) {
    const key = getInterestPlaceDedupeKey(place)
    const existingPlace = placesByKey.get(key)

    if (!existingPlace) {
      placesByKey.set(key, place)
      continue
    }

    if (getInterestPlaceScore(place) > getInterestPlaceScore(existingPlace)) {
      placesByKey.set(key, place)
    }
  }

  return [...placesByKey.values()]
}

const getOverpassCategoryFilters = (
  mode: OverpassQueryMode,
): readonly OverpassCategoryFilter[] => {
  switch (mode) {
    case 'core':
      return OVERPASS_CORE_CATEGORY_FILTERS
    case 'broad':
      return OVERPASS_BROAD_CATEGORY_FILTERS
    default:
      return OVERPASS_BROAD_CATEGORY_FILTERS
  }
}

const buildOverpassQuery = (
  [lat, lon]: number[],
  options: {
    mode: OverpassQueryMode
    radiusMeters: number
  },
) => {
  const selectors: string[] = []
  const categoryFilters = getOverpassCategoryFilters(options.mode)

  for (const { key, values } of categoryFilters) {
    for (const elementType of OVERPASS_ELEMENT_TYPES) {
      if (options.mode === 'enriched') {
        for (const enrichedTag of OVERPASS_ENRICHED_TAGS) {
          selectors.push(
            `${elementType}["${key}"~"${values}"]["name"]["${enrichedTag}"](around:${options.radiusMeters},${lat},${lon});`,
          )
        }
      } else {
        selectors.push(
          `${elementType}["${key}"~"${values}"]["name"](around:${options.radiusMeters},${lat},${lon});`,
        )
      }
    }
  }

  return `
    [out:json][timeout:${OVERPASS_SERVER_TIMEOUT_SECONDS}];
    (
      ${selectors.join('\n      ')}
    );
    out center qt ${OVERPASS_RESULT_LIMIT};
  `
}

const parseOverpassElements = (
  body: string,
  contentType: string,
): OSMElement[] | null => {
  if (
    !contentType.includes('application/json') &&
    !body.trim().startsWith('{')
  ) {
    return null
  }

  const data: OverpassResponse = JSON.parse(body)

  return dedupeInterestPlaces(
    (data?.elements ?? []).filter((element) => element.tags?.name),
  )
}

const logOverpassAttempt = (result: OverpassFetchResult, cityLabel: string) => {
  if (result.ok) {
    console.info(
      `[Overpass] city=${cityLabel} mode=${result.mode} radius=${result.radiusMeters} endpoint=${result.endpoint} pois=${result.places.length} durationMs=${result.durationMs}`,
    )
    return
  }

  console.warn(
    `[Overpass] city=${cityLabel} mode=${result.mode} radius=${result.radiusMeters} endpoint=${result.endpoint} error=${result.reason} durationMs=${result.durationMs}`,
  )
}

const fetchOverpassQuery = async (
  endpoint: string,
  query: string,
  options: {
    cityLabel: string
    mode: OverpassQueryMode
    radiusMeters: number
    timeoutMs: number
  },
): Promise<OverpassFetchResult> => {
  for (let retry = 0; retry <= OVERPASS_REQUEST_RETRIES; retry++) {
    const startedAt = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: buildOverpassHeaders(),
        body: query,
        signal: controller.signal,
      })

      const contentType = response.headers.get('content-type') ?? ''
      const body = await response.text()
      const durationMs = Date.now() - startedAt

      if (!response.ok) {
        if (response.status === 429) {
          const cooldownMs =
            getRetryAfterDelayMs(response.headers.get('retry-after')) ??
            OVERPASS_RATE_LIMIT_COOLDOWN_MS
          const cooldownSeconds = Math.ceil(cooldownMs / 1000)

          markOverpassEndpointCooldown(endpoint, cooldownMs)
          const rateLimitResult: OverpassFetchFailure = {
            ok: false,
            endpoint,
            mode: options.mode,
            radiusMeters: options.radiusMeters,
            durationMs,
            reason: `429 cooldown=${cooldownSeconds}s`,
          }

          logOverpassAttempt(rateLimitResult, options.cityLabel)

          return rateLimitResult
        }

        if (
          OVERPASS_RETRYABLE_STATUS_CODES.has(response.status) &&
          retry < OVERPASS_REQUEST_RETRIES
        ) {
          continue
        }

        const briefBody = body.slice(0, 120).replace(/\s+/g, ' ').trim()
        const failedResult: OverpassFetchFailure = {
          ok: false,
          endpoint,
          mode: options.mode,
          radiusMeters: options.radiusMeters,
          durationMs,
          reason: `status ${response.status} (${response.statusText})${briefBody ? ` ${briefBody}` : ''}`,
        }

        logOverpassAttempt(failedResult, options.cityLabel)

        return failedResult
      }

      const elements = parseOverpassElements(body, contentType)

      if (!elements) {
        const invalidResult: OverpassFetchFailure = {
          ok: false,
          endpoint,
          mode: options.mode,
          radiusMeters: options.radiusMeters,
          durationMs,
          reason: `non-JSON content-type (${contentType || 'unknown'})`,
        }

        logOverpassAttempt(invalidResult, options.cityLabel)

        return invalidResult
      }

      overpassEndpointCooldowns.delete(endpoint)

      const successResult: OverpassFetchSuccess = {
        ok: true,
        endpoint,
        mode: options.mode,
        radiusMeters: options.radiusMeters,
        durationMs,
        places: elements,
      }

      logOverpassAttempt(successResult, options.cityLabel)

      return successResult
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error))
      const durationMs = Date.now() - startedAt

      if (
        normalizedError.name === 'AbortError' &&
        retry < OVERPASS_REQUEST_RETRIES
      ) {
        continue
      }

      const errorResult: OverpassFetchFailure = {
        ok: false,
        endpoint,
        mode: options.mode,
        radiusMeters: options.radiusMeters,
        durationMs,
        reason:
          normalizedError.name === 'AbortError'
            ? 'timeout'
            : normalizedError.message,
      }

      logOverpassAttempt(errorResult, options.cityLabel)

      return errorResult
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return {
    ok: false,
    endpoint,
    mode: options.mode,
    radiusMeters: options.radiusMeters,
    durationMs: options.timeoutMs,
    reason: 'unknown',
  }
}

const getRemainingTimeMs = (deadlineAt: number) => deadlineAt - Date.now()

const getPhaseTimeoutMs = (
  mode: OverpassQueryMode,
  remainingTimeMs: number,
) => {
  const requestedTimeoutMs =
    mode === 'enriched'
      ? OVERPASS_ENRICHED_PHASE_TIMEOUT_MS
      : mode === 'broad'
        ? OVERPASS_BROAD_PHASE_TIMEOUT_MS
        : OVERPASS_CORE_PHASE_TIMEOUT_MS

  return Math.min(
    OVERPASS_CLIENT_TIMEOUT_MS,
    requestedTimeoutMs,
    Math.max(OVERPASS_MIN_PHASE_BUDGET_MS, remainingTimeMs - 200),
  )
}

const getOverpassQueryPlans = (
  cityContext: OverpassCityContext,
): OverpassQueryPlan[] => {
  const mediumRadiusIndex = Math.min(1, cityContext.radii.length - 1)
  const smallestRadiusIndex = cityContext.radii.length - 1

  return [
    {
      mode: 'enriched',
      radiusMeters: cityContext.radii[0],
      targetResults: cityContext.sufficientResults,
    },
    {
      mode: 'broad',
      radiusMeters: cityContext.radii[mediumRadiusIndex],
      targetResults: cityContext.acceptableResults,
    },
    {
      mode: 'core',
      radiusMeters: cityContext.radii[smallestRadiusIndex],
      targetResults: cityContext.acceptableResults,
    },
  ]
}

const runOverpassPhase = async (
  coords: number[],
  cityContext: OverpassCityContext,
  plan: OverpassQueryPlan,
  deadlineAt: number,
): Promise<OverpassPhaseResult> => {
  const initialRemainingTimeMs = getRemainingTimeMs(deadlineAt)

  if (initialRemainingTimeMs < OVERPASS_MIN_PHASE_BUDGET_MS) {
    return {
      places: [],
      endpoint: null,
      mode: plan.mode,
      radiusMeters: plan.radiusMeters,
    }
  }

  const phaseDeadlineAt =
    Date.now() + getPhaseTimeoutMs(plan.mode, initialRemainingTimeMs)
  const endpoints = getOverpassEndpointsForCoords()
  const query = buildOverpassQuery(coords, {
    mode: plan.mode,
    radiusMeters: plan.radiusMeters,
  })
  let bestPlaces: OSMElement[] = []
  let bestEndpoint: string | null = null

  for (let index = 0; index < endpoints.length; index += OVERPASS_ENDPOINT_BATCH_SIZE) {
    const remainingTimeMs = Math.min(
      getRemainingTimeMs(deadlineAt),
      getRemainingTimeMs(phaseDeadlineAt),
    )

    if (remainingTimeMs < OVERPASS_MIN_PHASE_BUDGET_MS) {
      break
    }

    const batch = endpoints.slice(index, index + OVERPASS_ENDPOINT_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map((endpoint) =>
        fetchOverpassQuery(endpoint, query, {
          cityLabel: cityContext.cityLabel,
          mode: plan.mode,
          radiusMeters: plan.radiusMeters,
          timeoutMs: Math.min(OVERPASS_CLIENT_TIMEOUT_MS, remainingTimeMs),
        }),
      ),
    )
    const successfulResults = batchResults.filter(
      (result): result is OverpassFetchSuccess => result.ok,
    )

    if (successfulResults.length > 0) {
      const mergedPlaces = dedupeInterestPlaces(
        successfulResults.flatMap((result) => result.places),
      )

      if (mergedPlaces.length > bestPlaces.length) {
        bestPlaces = mergedPlaces
        bestEndpoint =
          successfulResults
            .slice()
            .sort((left, right) => right.places.length - left.places.length)[0]
            ?.endpoint ?? batch[0] ?? null
      }

      if (bestPlaces.length >= plan.targetResults) {
        break
      }

      continue
    }

    if (bestPlaces.length > 0 || batch.length < OVERPASS_ENDPOINT_BATCH_SIZE) {
      break
    }
  }

  return {
    places: bestPlaces,
    endpoint: bestEndpoint,
    mode: plan.mode,
    radiusMeters: plan.radiusMeters,
  }
}

const mapNominatimResultToPlace = (result: NominatimPlaceSearchResult) => {
  const placeTags: OSMElement['tags'] = {
    name: result.name?.trim() || result.display_name.split(',')[0]?.trim(),
  }

  if (result.class === 'tourism') placeTags.tourism = result.type
  if (result.class === 'historic') placeTags.historic = result.type
  if (result.class === 'amenity') placeTags.amenity = result.type
  if (result.class === 'leisure') placeTags.leisure = result.type
  if (result.class === 'building') placeTags.building = result.type
  if (result.class === 'place') placeTags.place = result.type
  if (result.class === 'man_made') placeTags.man_made = result.type

  return {
    id: result.osm_id,
    type: result.osm_type,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    tags: placeTags,
  } satisfies OSMElement
}

const fetchNominatimPlaces = async (
  cityLabel: string,
  term: string,
  options: {
    timeoutMs: number
    coords: number[]
    city?: OSMAddress | null
    cityContext: OverpassCityContext
  },
) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs)
  const startedAt = Date.now()
  const canonicalCityName = getCanonicalCityQueryName(cityLabel)
  const viewBox = getNominatimViewBox(
    options.coords,
    options.city,
    options.cityContext,
  )
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    `${term} ${canonicalCityName}`.trim(),
  )}&limit=${NOMINATIM_RESCUE_LIMIT}&addressdetails=0&accept-language=es&bounded=1&viewbox=${viewBox.west},${viewBox.north},${viewBox.east},${viewBox.south}`

  try {
    const response = await fetch(endpoint, {
      headers: buildApiHeaders(),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.warn(
        `[NominatimRescue] city=${cityLabel} term=${term} error=status ${response.status} durationMs=${Date.now() - startedAt}`,
      )
      return []
    }

    const data = (await response.json()) as NominatimPlaceSearchResult[]
    const places = Array.isArray(data)
      ? data.map(mapNominatimResultToPlace).filter((place) => place.tags.name)
      : []

    console.info(
      `[NominatimRescue] city=${cityLabel} term=${term} pois=${places.length} durationMs=${Date.now() - startedAt}`,
    )

    return places
  } catch (error) {
    console.warn(
      `[NominatimRescue] city=${cityLabel} term=${term} error=${error instanceof Error ? error.message : String(error)} durationMs=${Date.now() - startedAt}`,
    )
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}

const searchInterestPlacesWithNominatim = async (
  coords: number[],
  options: {
    cityName?: string
    city?: OSMAddress | null
    cityContext: OverpassCityContext
    timeoutMs: number
  },
) => {
  const cityLabel = options.city?.name || options.cityName?.trim() || 'unknown'
  const terms =
    options.cityContext.size === 'small'
      ? NOMINATIM_RESCUE_SEARCH_TERMS.slice(0, 6)
      : NOMINATIM_RESCUE_SEARCH_TERMS
  const startedAt = Date.now()
  const results = await Promise.all(
    terms.map((term) =>
      fetchNominatimPlaces(cityLabel, term, {
        timeoutMs: options.timeoutMs,
        coords,
        city: options.city,
        cityContext: options.cityContext,
      }),
    ),
  )
  const places = dedupeInterestPlaces(results.flat())

  console.info(
    `[NominatimRescue] city=${cityLabel} coords=${coords[0].toFixed(4)},${coords[1].toFixed(4)} pois=${places.length} totalMs=${Date.now() - startedAt}`,
  )

  return places
}

const fetchInterestPlaces = async (
  coords: number[],
  options?: {
    cityName?: string
    city?: OSMAddress | null
  },
) => {
  const [lat, lon] = coords

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return {
      places: [],
      source: 'fallback' as const,
    }
  }

  const cityContext = getOverpassCityContext(options?.cityName, options?.city)
  const requestStartedAt = Date.now()
  const deadlineAt = requestStartedAt + OVERPASS_TOTAL_BUDGET_MS
  const queryPlans = getOverpassQueryPlans(cityContext)
  let bestPlaces: OSMElement[] = []
  let bestPhase: OverpassPhaseResult | null = null

  for (const plan of queryPlans) {
    const remainingTimeMs = getRemainingTimeMs(deadlineAt)

    if (remainingTimeMs < OVERPASS_MIN_PHASE_BUDGET_MS) {
      break
    }

    const phaseResult = await runOverpassPhase(
      [lat, lon],
      cityContext,
      plan,
      deadlineAt,
    )

    if (phaseResult.places.length > 0) {
      const mergedPlaces = dedupeInterestPlaces([
        ...bestPlaces,
        ...phaseResult.places,
      ])

      if (mergedPlaces.length >= bestPlaces.length) {
        bestPlaces = mergedPlaces
        bestPhase = phaseResult
      }
    }

    if (bestPlaces.length >= cityContext.sufficientResults) {
      break
    }

    if (
      plan.mode !== 'enriched' &&
      bestPlaces.length >= cityContext.acceptableResults
    ) {
      break
    }
  }

  const totalDurationMs = Date.now() - requestStartedAt

  if (bestPlaces.length > 0) {
    console.info(
      `[Overpass] city=${cityContext.cityLabel} coords=${lat.toFixed(4)},${lon.toFixed(4)} source=overpass queryMode=${bestPhase?.mode ?? 'unknown'} radius=${bestPhase?.radiusMeters ?? 0} endpoint=${bestPhase?.endpoint ?? 'n/a'} pois=${bestPlaces.length} partial=${bestPlaces.length < cityContext.acceptableResults} totalMs=${totalDurationMs} size=${cityContext.size} bboxKm=${cityContext.boundingBoxSpanKm?.toFixed(1) ?? 'n/a'}`,
    )

    return {
      places: bestPlaces,
      source: 'overpass' as const,
    }
  }

  const nominatimTimeLeftMs = getRemainingTimeMs(deadlineAt)

  if (nominatimTimeLeftMs >= NOMINATIM_RESCUE_MIN_TIME_LEFT_MS) {
    const fallbackPlaces = await searchInterestPlacesWithNominatim([lat, lon], {
      cityName: options?.cityName,
      city: options?.city,
      cityContext,
      timeoutMs: Math.min(
        NOMINATIM_RESCUE_REQUEST_TIMEOUT_MS,
        nominatimTimeLeftMs - 100,
      ),
    })

    if (fallbackPlaces.length > 0) {
      const fallbackDurationMs = Date.now() - requestStartedAt

      console.info(
        `[Overpass] city=${cityContext.cityLabel} coords=${lat.toFixed(4)},${lon.toFixed(4)} source=fallback queryMode=nominatim-rescue radius=0 endpoint=n/a pois=${fallbackPlaces.length} partial=false totalMs=${fallbackDurationMs} size=${cityContext.size} bboxKm=${cityContext.boundingBoxSpanKm?.toFixed(1) ?? 'n/a'}`,
      )

      return {
        places: fallbackPlaces,
        source: 'fallback' as const,
      }
    }
  }

  const fallbackDurationMs = Date.now() - requestStartedAt

  console.warn(
    `[Overpass] city=${cityContext.cityLabel} coords=${lat.toFixed(4)},${lon.toFixed(4)} source=fallback queryMode=none radius=0 endpoint=n/a pois=0 partial=false totalMs=${fallbackDurationMs} size=${cityContext.size} bboxKm=${cityContext.boundingBoxSpanKm?.toFixed(1) ?? 'n/a'}`,
  )

  return {
    places: [],
    source: 'fallback' as const,
  }
}

const getInterestPlaces = async (coords: number[]) => {
  const result = await fetchInterestPlaces(coords)

  return result.places
}

const getInterestPlacesByName = async (name: string) => {
  const city = await getCityByName(name)
  if (!city) return null

  const coords = getCoordsByCity(city)
  const result = await fetchInterestPlaces(coords, {
    cityName: name,
    city,
  })

  return {
    coords,
    places: result.places,
    city,
    source: result.source,
  }
}

const getWikiInfoByTitle = async (
  title: string,
  lang = 'es',
): Promise<WikiData | null> => {
  const normalizedTitle = normalizeWikiTitle(title)

  if (!normalizedTitle) return null

  return memoizeAsync(
    wikiInfoByTitleCache,
    buildWikiCacheKey(lang, normalizedTitle),
    async () => {
      const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        normalizedTitle.replace(/ /g, '_'),
      )}`
      const data = await fetchWikipediaJson<WikiSummaryResponse>(endpoint)

      if (!data) return null

      return {
        title: data.title || normalizedTitle,
        extract: data.extract ?? '',
        thumbnail: getSummaryThumbnail(data),
        heroImage: getSummaryHeroImage(data),
      }
    },
  )
}

const getSpanishTitle = async (
  title: string,
  fromLang: string,
): Promise<string | null> => {
  const normalizedTitle = normalizeWikiTitle(title)

  if (!normalizedTitle) return null
  if (fromLang === 'es') return normalizedTitle

  return memoizeAsync(
    spanishTitleCache,
    buildWikiCacheKey(fromLang, normalizedTitle),
    async () => {
      const endpoint = `https://${fromLang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&lllang=es&titles=${encodeURIComponent(
        normalizedTitle,
      )}&origin=*`
      const data = await fetchWikipediaJson<WikiLangLinksResponse>(endpoint)
      const pages = data?.query?.pages

      if (!pages) return null

      const pageId = Object.keys(pages)[0]

      if (!pageId || pageId === '-1' || !pages[pageId]?.langlinks?.length) {
        return null
      }

      return pages[pageId].langlinks[0]['*'] ?? null
    },
  )
}

const getPlaceImage = (
  place: Pick<OSMElement, 'tags'>,
  wikiInfo?: WikiData | null,
) => {
  const candidates = [
    wikiInfo?.thumbnail?.source,
    place.tags.wikipedia_image,
    place.tags.image,
    place.tags['wikimedia_commons:path'],
    place.tags.wikimedia_commons,
  ]

  for (const candidate of candidates) {
    const renderableImage = toRenderableImageUrl(candidate)

    if (renderableImage) return renderableImage
  }

  return null
}

const getWikiInfo = async (wikiTag: string): Promise<WikiData | null> => {
  const normalizedTag = wikiTag.trim()

  if (!normalizedTag) return null

  const [lang, title] = splitWikiTag(normalizedTag)

  return memoizeAsync(wikiInfoCache, buildWikiCacheKey(lang, title), async () => {
    const spanishTitle = await getSpanishTitle(title, lang)

    if (spanishTitle) {
      const spanishInfo = await getWikiInfoByTitle(spanishTitle, 'es')

      if (
        spanishInfo?.thumbnail?.source ||
        spanishInfo?.heroImage?.source ||
        lang === 'es'
      ) {
        return spanishInfo
      }

      const originalInfo = await getWikiInfoByTitle(title, lang)

      if (spanishInfo) {
        return {
          ...spanishInfo,
          extract: spanishInfo.extract || originalInfo?.extract || '',
          thumbnail: spanishInfo.thumbnail ?? originalInfo?.thumbnail,
          heroImage: spanishInfo.heroImage ?? originalInfo?.heroImage,
        }
      }

      return originalInfo
    }

    return getWikiInfoByTitle(title, lang)
  })
}

export const locationsService = {
  getCitiesByName,
  getCityByName,
  getCoordsByCity,
  getInterestPlaces,
  getInterestPlacesByName,
  getPlaceImage,
  getWikiInfo,
  getWikiInfoByTitle,
  normalizeCanonicalImageUrl,
  toRenderableImageUrl,
}
