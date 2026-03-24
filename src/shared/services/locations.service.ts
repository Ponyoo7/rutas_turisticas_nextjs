import { wait } from '@/lib/utils'
import {
  OSMAddress,
  OSMElement,
  OverpassResponse,
  WikiData,
} from '../types/locations'

const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

const OVERPASS_RADIUS_METERS = 2000
const OVERPASS_SERVER_TIMEOUT_SECONDS = 120
const OVERPASS_CLIENT_TIMEOUT_MS = 200000000
const OVERPASS_RATE_LIMIT_RETRY_DELAY_MS = 1500
const OVERPASS_RATE_LIMIT_RETRIES = 3
const WIKI_RETRY_DELAY_MS = 600
const WIKI_RETRY_ATTEMPTS = 3
const WIKI_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const IMAGE_EXTENSION_REGEX =
  /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i
const COMMONS_FILE_PATH_PREFIX =
  'https://commons.wikimedia.org/wiki/Special:FilePath/'
const WIKI_IMAGE_PROXY_PATH = '/api/wiki-image'
const ROUTECRAFT_USER_AGENT = 'RouteCraft/1.0 (contacto: cqc1999@gmail.com)'
const ROUTECRAFT_REFERER = 'https://rutas-turisticas-nextjs.vercel.app/'

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
    headers.set('Referer', ROUTECRAFT_REFERER)
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

const isWikiImageProxyUrl = (value: string) =>
  value.startsWith(`${WIKI_IMAGE_PROXY_PATH}?url=`)

const shouldProxyWikiImage = (urlLike: string) => {
  if (isWikiImageProxyUrl(urlLike)) return false

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

const toClientImageUrl = (source: string) =>
  shouldProxyWikiImage(source)
    ? `${WIKI_IMAGE_PROXY_PATH}?url=${encodeURIComponent(source)}`
    : source

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

const normalizeImageSource = (source?: string | null) => {
  if (typeof source !== 'string') return null

  const trimmedSource = source.trim()

  if (!trimmedSource || /^Category:/i.test(trimmedSource)) return null
  if (isWikiImageProxyUrl(trimmedSource)) return trimmedSource

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

const getSummaryThumbnail = (
  data: WikiSummaryResponse,
): WikiData['thumbnail'] | undefined => {
  const thumbnailSource = normalizeImageSource(data.thumbnail?.source)

  if (thumbnailSource && data.thumbnail) {
    return {
      ...data.thumbnail,
      source: toClientImageUrl(thumbnailSource),
    }
  }

  const originalImageSource = normalizeImageSource(data.originalimage?.source)

  if (originalImageSource && data.originalimage) {
    return {
      ...data.originalimage,
      source: toClientImageUrl(originalImageSource),
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

/**
 * Busca ciudades por nombre utilizando la API de Nominatim (OpenStreetMap).
 * Retorna una lista de coincidencias ordenadas por relevancia.
 */
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

const getCityByName = async (name: string): Promise<OSMAddress> => {
  const cities = await getCitiesByName(name, 1)

  return cities[0]
}

const getCoordsByCity = (city: OSMAddress): number[] => {
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

/**
 * Obtiene lugares de interés (museos, atracciones, monumentos) cercanos a unas coordenadas dadas
 * utilizando la API de Overpass. Implementa reintentos automáticos y rotación de servidores (endpoints)
 * en caso de fallos o límite de peticiones (Rate Limit).
 */
const getInterestPlaces = async (coords: number[]) => {
  const [lat, lon] = coords

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []

  const query = buildOverpassQuery([lat, lon])

  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let retry = 0; retry <= OVERPASS_RATE_LIMIT_RETRIES; retry++) {
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
          if (response.status === 429 && retry < OVERPASS_RATE_LIMIT_RETRIES) {
            console.warn(
              `[Overpass] 429 in ${endpoint}. Retrying in ${OVERPASS_RATE_LIMIT_RETRY_DELAY_MS / 1000}s.`,
            )
            await wait(OVERPASS_RATE_LIMIT_RETRY_DELAY_MS)
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

        return elements.filter((e) => e.tags?.name && e.tags?.wikipedia)
      } catch (error) {
        console.error(error)

        throw new Error('Error de uso en la api de Overpass')
      } finally {
        clearTimeout(timeoutId)
      }
    }

    await wait(300)
  }

  console.error(
    '[Overpass] Could not fetch interest places from available endpoints.',
  )

  return []
}

const getInterestPlacesByName = async (name: string) => {
  const city = await getCityByName(name)

  const coords = getCoordsByCity(city)

  const places = await getInterestPlaces(coords)

  return {
    coords,
    places,
    city,
  }
}

/**
 * Obtiene el resumen y la imagen en miniatura de un artículo de Wikipedia usando su API REST.
 * Es más efectiva y rápida para extraer introducciones y fotos principales en comparación con la API Action.
 */
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
    const normalizedImage = normalizeImageSource(candidate)

    if (normalizedImage) return toClientImageUrl(normalizedImage)
  }

  return null
}

/**
 * Función principal para obtener información de Wikipedia de un lugar.
 * Primero intenta localizar si existe una versión del artículo en español (usando getSpanishTitle) y,
 * si la encuentra, devuelve la información en español. Si no, usa el idioma original.
 */
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
}
