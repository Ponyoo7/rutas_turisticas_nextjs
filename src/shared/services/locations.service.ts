import { wait } from '@/lib/utils'
import {
  InterestPlacesByNameResult,
  OSMAddress,
  OSMElement,
  OverpassResponse,
  WikiData,
} from '../types/locations'
import { searchCitiesWithNominatim } from './nominatim.service'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

const OVERPASS_RADIUS_METERS = 2000
const OVERPASS_SERVER_TIMEOUT_SECONDS = 120
const OVERPASS_CLIENT_TIMEOUT_MS = 15000
const OVERPASS_RETRY_DELAY_MS = 1500
const OVERPASS_REQUEST_RETRIES = 3
const OVERPASS_RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const WIKI_RETRY_DELAY_MS = 600
const WIKI_RETRY_ATTEMPTS = 3
const WIKI_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const IMAGE_EXTENSION_REGEX =
  /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i
const COMMONS_FILE_PATH_PREFIX =
  'https://commons.wikimedia.org/wiki/Special:FilePath/'
const WIKI_IMAGE_PROXY_PATH = '/api/wiki-image'
const ROUTECRAFT_USER_AGENT =
  'RouteCraft/1.0 (https://rutas-turisticas-nextjs.vercel.app; cqc1999@gmail.com)'

interface WikiSummaryResponse {
  title?: string
  extract?: string
  thumbnail?: WikiData['thumbnail']
  originalimage?: WikiData['thumbnail']
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

const buildApiHeaders = (options?: { includeFormContentType?: boolean }) => {
  const headers = new Headers()

  if (options?.includeFormContentType) {
    headers.set(
      'Content-Type',
      'application/x-www-form-urlencoded; charset=UTF-8',
    )
  }

  if (typeof window === 'undefined') {
    headers.set('User-Agent', ROUTECRAFT_USER_AGENT)
    // headers.set('Referer', ROUTECRAFT_REFERER)
  }

  return headers
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

const getSummaryThumbnail = (
  data: WikiSummaryResponse,
): WikiData['thumbnail'] | undefined => {
  const thumbnailSource = normalizeCanonicalImageUrl(data.thumbnail?.source)

  if (thumbnailSource && data.thumbnail) {
    return {
      ...data.thumbnail,
      source: thumbnailSource,
    }
  }

  const originalImageSource = normalizeCanonicalImageUrl(
    data.originalimage?.source,
  )

  if (originalImageSource && data.originalimage) {
    return {
      ...data.originalimage,
      source: originalImageSource,
    }
  }

  return undefined
}

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
): Promise<OSMAddress[]> => searchCitiesWithNominatim(name, limit)

const getCityByName = async (name: string): Promise<OSMAddress | null> => {
  const cities = await getCitiesByName(name, 1)

  return cities[0] ?? null
}

const getCoordsByCity = (city: OSMAddress): [number, number] => {
  return [parseFloat(city.lat), parseFloat(city.lon)]
}

const buildOverpassQuery = ([lat, lon]: number[]) => {
  return `
    [out:json][timeout:${OVERPASS_SERVER_TIMEOUT_SECONDS}];
    (
      nwr["tourism"~"museum|attraction"]["name"]["wikipedia"](around:${OVERPASS_RADIUS_METERS},${lat},${lon});
      nwr["historic"~"monument|memorial|archaeological_site"]["name"]["wikipedia"](around:${OVERPASS_RADIUS_METERS},${lat},${lon});
    );
    out center qt;
  `
}

const getInterestPlaces = async (coords: number[]) => {
  const [lat, lon] = coords

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []

  const query = buildOverpassQuery([lat, lon])
  let lastError: Error | null = null

  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let retry = 0; retry <= OVERPASS_REQUEST_RETRIES; retry++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        OVERPASS_CLIENT_TIMEOUT_MS,
      )

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: buildApiHeaders({ includeFormContentType: true }),
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        })

        const contentType = response.headers.get('content-type') ?? ''
        const body = await response.text()

        if (!response.ok) {
          if (
            OVERPASS_RETRYABLE_STATUS_CODES.has(response.status) &&
            retry < OVERPASS_REQUEST_RETRIES
          ) {
            console.warn(
              `[Overpass] ${response.status} in ${endpoint}. Retrying in ${OVERPASS_RETRY_DELAY_MS / 1000}s.`,
            )
            await wait(OVERPASS_RETRY_DELAY_MS)
            continue
          }

          const briefBody = body.slice(0, 120).replace(/\s+/g, ' ').trim()
          throw new Error(
            `status ${response.status} (${response.statusText})${briefBody ? `: ${briefBody}` : ''}`,
          )
        }

        if (
          !contentType.includes('application/json') &&
          !body.trim().startsWith('{')
        ) {
          throw new Error(`non-JSON content-type (${contentType || 'unknown'})`)
        }

        const data: OverpassResponse = JSON.parse(body)
        const elements = data?.elements ?? []

        return elements.filter(
          (element) => element.tags?.name && element.tags?.wikipedia,
        )
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error))

        if (
          normalizedError.name === 'AbortError' &&
          retry < OVERPASS_REQUEST_RETRIES
        ) {
          console.warn(
            `[Overpass] Timeout in ${endpoint}. Retrying in ${OVERPASS_RETRY_DELAY_MS / 1000}s.`,
          )
          await wait(OVERPASS_RETRY_DELAY_MS)
          continue
        }

        lastError = normalizedError
        console.warn(
          `[Overpass] Failed in ${endpoint}: ${normalizedError.message}`,
        )
        break
      } finally {
        clearTimeout(timeoutId)
      }
    }

    await wait(300)
  }

  console.error(
    '[Overpass] Could not fetch interest places from available endpoints.',
    lastError,
  )

  return []
}

const getInterestPlacesByName = async (
  name: string,
): Promise<InterestPlacesByNameResult | null> => {
  const city = await getCityByName(name)
  if (!city) return null

  const coords = getCoordsByCity(city)

  const places = await getInterestPlaces(coords)

  return {
    coords,
    places,
    city,
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
  place: Pick<OSMElement, 'tags' | 'wikiInfo'>,
  wikiInfo?: WikiData | null,
) => {
  const resolvedWikiInfo = wikiInfo ?? place.wikiInfo
  const candidates = [
    resolvedWikiInfo?.thumbnail?.source,
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

      if (spanishInfo?.thumbnail?.source || lang === 'es') {
        return spanishInfo
      }

      const originalInfo = await getWikiInfoByTitle(title, lang)

      if (spanishInfo) {
        return {
          ...spanishInfo,
          extract: spanishInfo.extract || originalInfo?.extract || '',
          thumbnail: spanishInfo.thumbnail ?? originalInfo?.thumbnail,
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
