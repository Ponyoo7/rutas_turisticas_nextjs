import { wait } from '@/lib/utils'
import { OSMAddress, OverpassResponse, WikiData } from '../types/locations'

const getCitiesByName = async (
  name: string,
  limit = 8,
): Promise<OSMAddress[]> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      name,
    )}&limit=${limit}`,
  )
  const dataJson = await res.json()

  return Array.isArray(dataJson) ? dataJson : []
}

const getCityByName = async (name: string): Promise<OSMAddress | null> => {
  const cities = await getCitiesByName(name, 1)

  return cities.length > 0 ? cities[0] : null
}

const getCoordsByCity = (city: OSMAddress): number[] => {
  return [parseFloat(city.lat), parseFloat(city.lon)]
}

const getInterestPlaces = async (coords: number[]) => {
  const maxAttempts = 4
  const baseDelayMs = 800
  let currentAttempt = 0

  while (currentAttempt < maxAttempts) {
    try {
      const query = `
                [out:json][timeout:60];
                (
                    // Buscamos Nodos, Ways y Relations (nwr)
                    nwr["tourism"~"museum|attraction"](around:3000, ${coords[0]}, ${coords[1]});
                    nwr["historic"~"monument|memorial|archaeological_site"](around:3000, ${coords[0]}, ${coords[1]});
                );
                // Importante: 'out center' para obtener coordenadas de areas
                out center;
            `
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      )
      const contentType = response.headers.get('content-type') ?? ''
      const body = await response.text()

      if (!response.ok) {
        throw new Error(
          `Overpass respondi� con estado ${response.status} (${response.statusText})`,
        )
      }

      if (!contentType.includes('application/json')) {
        throw new Error(
          `Overpass devolvi� content-type no JSON (${contentType || 'desconocido'})`,
        )
      }

      const data: OverpassResponse = JSON.parse(body)

      return data?.elements
        ? data.elements.filter((e) => e.tags?.name && e.tags?.wikipedia)
        : []
    } catch (e) {
      currentAttempt++
      console.error(
        `Intento ${currentAttempt}/${maxAttempts} en Overpass fall�`,
        e,
      )

      if (currentAttempt >= maxAttempts) break

      await wait(baseDelayMs * currentAttempt)
    }
  }

  return []
}

const getInterestPlacesByName = async (name: string) => {
  const city = await getCityByName(name)

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
  lang = 'en',
): Promise<WikiData | null> => {
  const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(title)}&pithumbsize=500&origin=*`

  try {
    const res = await fetch(endpoint)
    const data = await res.json()
    const pages = data.query.pages
    const pageId = Object.keys(pages)[0]

    if (pageId === '-1') return null

    return {
      title: pages[pageId].title,
      extract: pages[pageId].extract,
      thumbnail: pages[pageId].thumbnail,
    }
  } catch (error) {
    console.error('Error en Wikipedia API:', error)
    return null
  }
}

const getWikiInfo = async (wikiTag: string): Promise<WikiData | null> => {
  const [lang, title] = wikiTag.includes(':')
    ? wikiTag.split(':')
    : ['en', wikiTag]

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
