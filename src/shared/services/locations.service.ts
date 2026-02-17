import { wait } from '@/lib/utils'
import { OSMAddress, OverpassResponse, WikiData } from '../types/locations'

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

const getInterestPlaces = async (coords: number[]) => {
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
