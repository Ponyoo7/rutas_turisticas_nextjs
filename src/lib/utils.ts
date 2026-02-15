import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OSMElement } from '@/shared/types/locations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const EARTH_RADIUS_KM = 6371
const WALKING_SPEED_KMH = 5

export const getPlaceCoords = (place: OSMElement): [number, number] | null => {
  const lat = place.lat ?? place.center?.lat
  const lon = place.lon ?? place.center?.lon

  if (lat == null || lon == null) return null

  return [lat, lon]
}

export const getDistanceKm = (origin: OSMElement, target: OSMElement) => {
  const originCoords = getPlaceCoords(origin)
  const targetCoords = getPlaceCoords(target)

  if (!originCoords || !targetCoords) return 0

  const [lat1, lon1] = originCoords
  const [lat2, lon2] = targetCoords

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

export const getRouteStats = (places: OSMElement[]) => {
  let totalDistanceKm = 0

  for (let i = 0; i < places.length - 1; i++) {
    totalDistanceKm += getDistanceKm(places[i], places[i + 1])
  }

  const totalMinutes = Math.round((totalDistanceKm / WALKING_SPEED_KMH) * 60)

  return {
    placesCount: places.length,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalMinutes,
  }
}

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) return `${hours} h`

  return `${hours} h ${remainingMinutes} min`
}

export const getPlaceTypeLabel = (place: OSMElement) => {
  if (place.tags.historic === 'archaeological_site') return 'Sitio arqueologico'
  if (place.tags.historic === 'monument') return 'Monumento'
  if (place.tags.historic === 'memorial') return 'Memorial'
  if (place.tags.tourism === 'museum') return 'Museo'
  if (place.tags.tourism === 'attraction') return 'Atraccion'

  return 'Punto de interes'
}
