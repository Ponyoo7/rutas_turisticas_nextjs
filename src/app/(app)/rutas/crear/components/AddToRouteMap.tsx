'use client'

import { MapWrapper } from '@/shared/components/map/MapWrapper'
import { OSMAddress, OSMElement } from '@/shared/types/locations'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { PlaceCard } from './PlaceCard'
import { saveRoute } from '@/actions/routes.actions'
import { locationsService } from '@/shared/services/locations.service'
import { Input } from '@/shared/components/ui/input'
import { formatDuration, getDistanceKm, getRouteStats } from '@/lib/utils'

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

  const routeStats = getRouteStats(routePlaces)

  const reorganizeRoute = () => {
    if (routePlaces.length <= 2) return

    const original = [...routePlaces]
    const reordered = [original.shift() as OSMElement]

    while (original.length > 0) {
      const last = reordered[reordered.length - 1]
      let nearestIndex = 0
      let minDistance = getDistanceKm(last, original[0])

      for (let i = 1; i < original.length; i++) {
        const dist = getDistanceKm(last, original[i])
        if (dist < minDistance) {
          minDistance = dist
          nearestIndex = i
        }
      }

      reordered.push(original.splice(nearestIndex, 1)[0])
    }

    setRoutePlaces(reordered)
  }

  const removePlace = (placeId: number) => {
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
              <span className="flex items-center gap-1">
                {routeStats.totalDistanceKm} km
              </span>
              <span className="flex items-center gap-1">
                {formatDuration(routeStats.totalMinutes)}
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

