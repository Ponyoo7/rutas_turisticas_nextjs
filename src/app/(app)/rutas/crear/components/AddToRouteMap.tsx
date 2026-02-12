'use client'

import { MapWrapper } from '@/shared/components/map/MapWrapper'
import { OSMAddress, OSMElement } from '@/shared/types/locations'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { PlaceCard } from './PlaceCard'
import { saveRoute } from '@/actions/routes.actions'
import { locationsService } from '@/shared/services/locations.service'
import { Input } from '@/shared/components/ui/input'

interface Props {
  places: OSMElement[]
  coords: number[]
  city: OSMAddress
}

export const AddToRouteMap = ({ places, coords, city }: Props) => {
  const [routePlaces, setRoutePlaces] = useState<OSMElement[]>([])
  const [routeName, setRouteName] = useState<string>('')

  const addPlaceToRoute = (place: OSMElement) => {
    const newRoutePlaces = [...routePlaces, place]
    setRoutePlaces(newRoutePlaces)
  }

  const getDistance = (p1: OSMElement, p2: OSMElement) => {
    const lat1 = p1.lat || p1.center?.lat || 0
    const lon1 = p1.lon || p1.center?.lon || 0
    const lat2 = p2.lat || p2.center?.lat || 0
    const lon2 = p2.lon || p2.center?.lon || 0

    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateTotalStats = () => {
    let totalKm = 0
    for (let i = 0; i < routePlaces.length - 1; i++) {
      totalKm += getDistance(routePlaces[i], routePlaces[i + 1])
    }

    const walkingSpeedKmh = 5
    const totalMinutes = (totalKm / walkingSpeedKmh) * 60

    return {
      distance: totalKm.toFixed(2),
      time: Math.round(totalMinutes),
    }
  }

  const { distance, time } = calculateTotalStats()

  const reorganizeRoute = () => {
    if (routePlaces.length <= 2) return

    const original = [...routePlaces]
    const reordered = [original.shift() as OSMElement]

    while (original.length > 0) {
      const last = reordered[reordered.length - 1]
      let nearestIndex = 0
      let minDistance = getDistance(last, original[0])

      for (let i = 1; i < original.length; i++) {
        const dist = getDistance(last, original[i])
        if (dist < minDistance) {
          minDistance = dist
          nearestIndex = i
        }
      }

      reordered.push(original.splice(nearestIndex, 1)[0])
    }

    setRoutePlaces(reordered)
  }

  const removePlace = (placeId: any) => {
    const newRoutePlaces = routePlaces.filter((r) => r.id !== placeId)

    setRoutePlaces(newRoutePlaces)
  }

  const handleSave = async () => {
    const wikiCity = await locationsService.getWikiInfo(`es:${city.name}`)

    await saveRoute({
      name: routeName,
      places: routePlaces,
      image: wikiCity?.thumbnail?.source ?? '',
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Input
            placeholder="Nombre de la ruta"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
          {routePlaces.length > 1 && (
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">🚶 {distance} km</span>
              <span className="flex items-center gap-1">
                ⏱️{' '}
                {time >= 60
                  ? `${Math.floor(time / 60)}h ${time % 60}min`
                  : `${time} min`}
              </span>
            </div>
          )}
        </div>
        {routePlaces.length > 1 && (
          <Button onClick={reorganizeRoute} variant="outline" size="sm">
            Reorganizar por proximidad
          </Button>
        )}
      </div>

      <MapWrapper
        places={places}
        coords={coords}
        onClick={addPlaceToRoute}
        routePlaces={routePlaces}
      />

      <Button onClick={handleSave}>Guardar</Button>
      <div className="flex flex-wrap gap-2">
        {routePlaces.map((r, i) => (
          <PlaceCard
            key={r.id}
            place={r}
            index={i + 1}
            onDelete={removePlace}
          />
        ))}
      </div>
    </div>
  )
}
