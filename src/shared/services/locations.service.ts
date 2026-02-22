import { wait } from '@/lib/utils'
import { OSMAddress, OverpassResponse, WikiData } from '../types/locations'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const OVERPASS_RADIUS_METERS = 2000
const OVERPASS_SERVER_TIMEOUT_SECONDS = 120
const OVERPASS_CLIENT_TIMEOUT_MS = 12000
const OVERPASS_RATE_LIMIT_RETRY_DELAY_MS = 30000
const OVERPASS_RATE_LIMIT_RETRIES = 1

const getCitiesByName = async (
  name: string,
  limit = 8,
): Promise<OSMAddress[]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        name,
      )}&limit=${limit}&accept-language=es`,
    )
    const dataJson = await res.json()

    return Array.isArray(dataJson) ? dataJson : []
  } catch (e) {
    console.log(e)

    return []
  }
}

const getCityByName = async (name: string): Promise<OSMAddress | null> => {
  const cities = await getCitiesByName(name, 1)

  return cities.length > 0 ? cities[0] : null
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
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
        const reason = error instanceof Error ? error.message : String(error)
        console.warn(`[Overpass] Request failed in ${endpoint}: ${reason}`)
        
        throw new Error('Error de uso en la api de Overpass')
      } finally {
        clearTimeout(timeoutId)
      }
    }

    await wait(300)
  }

  console.error('[Overpass] Could not fetch interest places from available endpoints.')

  return []
}

const getInterestPlacesByName = async (name: string) => {
  const city = await getCityByName(name)

  console.log(city)

  if (!city) return

  const coords = getCoordsByCity(city)

  if (!coords) return

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
  // Wikipedia REST API is more reliable for summaries and images
  const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title.replace(/ /g, '_'),
  )}`

  try {
    const res = await fetch(endpoint)

    if (!res.ok) {
      if (res.status === 404) return null
      console.warn(`Wikipedia REST API responded with ${res.status}`)
      return null
    }

    const data = await res.json()

    return {
      title: data.title || title,
      extract: data.extract,
      thumbnail: data.thumbnail,
    }
  } catch (error) {
    console.error('Error en Wikipedia API:', error)
    return null
  }
}

const getSpanishTitle = async (
  title: string,
  fromLang: string,
): Promise<string | null> => {
  if (fromLang === 'es') return title

  const endpoint = `https://${fromLang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&lllang=es&titles=${encodeURIComponent(
    title,
  )}&origin=*`

  try {
    const res = await fetch(endpoint)
    const data = await res.json()
    const pages = data.query.pages
    const pageId = Object.keys(pages)[0]

    if (pageId === '-1' || !pages[pageId].langlinks) return null

    return pages[pageId].langlinks[0]['*']
  } catch (error) {
    console.error('Error al buscar título en español:', error)
    return null
  }
}

const getWikiInfo = async (wikiTag: string): Promise<WikiData | null> => {
  const [lang, title] = wikiTag.includes(':')
    ? wikiTag.split(':')
    : ['en', wikiTag]

  // Intentamos obtener la versión en español
  const spanishTitle = await getSpanishTitle(title, lang)

  if (spanishTitle) {
    return getWikiInfoByTitle(spanishTitle, 'es')
  }

  // Si no hay versión en español, intentamos con el idioma original
  return getWikiInfoByTitle(title, lang)
}

export const locationsService = {
  getCitiesByName,
  getCityByName,
  getCoordsByCity,
  getInterestPlaces,
  getInterestPlacesByName,
  getWikiInfo,
  getWikiInfoByTitle,
}
