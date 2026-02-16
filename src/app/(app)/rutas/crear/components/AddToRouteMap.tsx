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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Input
            placeholder="Nombre de la ruta..."
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="text-lg font-semibold border-gray-200 focus:border-[#533d2d] focus:ring-[#533d2d] transition-all"
          />
          {routePlaces.length > 1 && (
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
              <span className="flex items-center gap-1 border-r border-gray-200 pr-4">
                {routeStats.totalDistanceKm} km
              </span>
              <span className="flex items-center gap-1">
                {formatDuration(routeStats.totalMinutes)}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {routePlaces.length > 1 && (
            <Button
              onClick={reorganizeRoute}
              variant="outline"
              size="sm"
              className="border-[#533d2d] text-[#533d2d] hover:bg-[#533d2d]/10 transition-colors"
            >
              Reorganizar por proximidad
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!routeName || routePlaces.length === 0}
            className="bg-[#533d2d] hover:bg-[#433124] transition-colors shadow-md disabled:bg-gray-300"
          >
            Guardar Ruta
          </Button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-gray-50 p-1">
        <MapWrapper
          places={places}
          coords={coords}
          onClick={addPlaceToRoute}
          routePlaces={routePlaces}
        />
      </div>

      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 min-h-24">
        {routePlaces.length === 0 ? (
          <p className="text-gray-400 text-sm flex items-center justify-center w-full">
            Toca sitios en el mapa para añadirlos a tu ruta
          </p>
        ) : (
          routePlaces.map((r, i) => (
            <PlaceCard
              key={r.id}
              place={r}
              index={i + 1}
              onDelete={removePlace}
            />
          ))
        )}
      </div>
    </div>
  )
}
