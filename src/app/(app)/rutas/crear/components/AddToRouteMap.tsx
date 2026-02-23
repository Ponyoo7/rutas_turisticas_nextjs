'use client'

import { MapWrapper } from '@/shared/components/map/MapWrapper'
import { OSMAddress, OSMElement } from '@/shared/types/locations'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { PlaceCard } from './PlaceCard'
import { saveRoute, updateRoute } from '@/actions/routes.actions'
import { locationsService } from '@/shared/services/locations.service'
import { Input } from '@/shared/components/ui/input'
import { getDistanceKm } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { IconLoader2 } from '@tabler/icons-react'

interface Props {
  places: OSMElement[]
  coords: number[]
  city?: OSMAddress
  routeId?: number
  initialRouteName?: string
  initialRoutePlaces?: OSMElement[]
  initialImage?: string
}

export const AddToRouteMap = ({
  places,
  coords,
  city,
  routeId,
  initialRouteName = '',
  initialRoutePlaces = [],
  initialImage = '',
}: Props) => {
  const router = useRouter()
  const isEditMode = typeof routeId === 'number'
  const [isSaving, setIsSaving] = useState(false)

  const [routePlaces, setRoutePlaces] =
    useState<OSMElement[]>(initialRoutePlaces)
  const [routeName, setRouteName] = useState<string>(initialRouteName)

  const addPlaceToRoute = (place: OSMElement) => {
    if (routePlaces.some((p) => p.id === place.id)) return
    const newRoutePlaces = [...routePlaces, place]
    setRoutePlaces(newRoutePlaces)
  }

  /**
   * Reorganiza los lugares de la ruta basándose en el algoritmo del "Vecino Más Cercano"
   * (Nearest Neighbor). Comienza por el primer lugar seleccionado y busca secuencialmente
   * el punto más cercano restante para optimizar el camino.
   */
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

  /**
   * Guarda o actualiza la ruta actual.
   * Si está en modo edición, invoca `updateRoute`.
   * Si es una ruta nueva, intenta obtener información de la ciudad en Wikipedia
   * (como una imagen principal) antes de guardarla con `saveRoute`.
   */
  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isEditMode && routeId) {
        await updateRoute({
          id: routeId,
          name: routeName,
          places: routePlaces,
          image: initialImage || undefined,
        })

        router.replace(`/rutas/${routeId}`)
        return
      }

      const wikiCity = city
        ? await locationsService.getWikiInfo(`es:${city.name}`)
        : null

      await saveRoute({
        name: routeName,
        places: routePlaces,
        image: wikiCity?.thumbnail?.source ?? initialImage,
      })

      router.replace('/')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl overflow-hidden p-1">
        <MapWrapper
          places={places}
          coords={coords}
          onClick={addPlaceToRoute}
          routePlaces={routePlaces}
        />
      </div>

      <div className="gap-2 w-full grid grid-cols-1 md:grid-cols-2">
        <Input
          placeholder="Nombre de la ruta..."
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="h-14 text-lg border-artis-primary focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6"
        />
        <div className="flex gap-2 w-full md:w-auto items-center">
          {routePlaces.length > 1 && (
            <Button
              onClick={reorganizeRoute}
              variant="outline"
              // size="sm"
              className="bg-white text-artis-primary hover:bg-gray-100 font-bold shadow-lg border border-artis-primary transition-colors"
            >
              Reorganizar por proximidad
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!routeName || routePlaces.length === 0 || isSaving}
            className="bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none transition-colors disabled:bg-gray-300"
          >
            {isSaving ? (
              <>
                <IconLoader2 className="animate-spin" />
                Guardando...
              </>
            ) : isEditMode ? (
              'Actualizar Ruta'
            ) : (
              'Guardar Ruta'
            )}
          </Button>
        </div>
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
