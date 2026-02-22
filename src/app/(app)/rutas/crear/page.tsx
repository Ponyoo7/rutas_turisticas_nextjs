import { getMyRouteById } from '@/actions/routes.actions'
import { getPlaceCoords } from '@/lib/utils'
import { locationsService } from '@/shared/services/locations.service'
import {
  getInterestPlacesByCoordsCached,
  getInterestPlacesByNameCached,
} from '@/shared/services/locations.cached.server'
import { OSMElement } from '@/shared/types/locations'
import { notFound } from 'next/navigation'
import { AddToRouteMap } from './components/AddToRouteMap'

const mergePlaces = (basePlaces: OSMElement[], extraPlaces: OSMElement[]) => {
  const seen = new Set<number>()
  const result: OSMElement[] = []

  for (const place of [...basePlaces, ...extraPlaces]) {
    if (seen.has(place.id)) continue
    seen.add(place.id)
    result.push(place)
  }

  return result
}

export default async function CrearRutaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const cityParam = typeof params.city === 'string' ? params.city : undefined
  const routeIdParam =
    typeof params.routeId === 'string' ? Number(params.routeId) : null

  const isEditMode =
    routeIdParam != null && Number.isInteger(routeIdParam) && routeIdParam > 0
  const routeToEdit = isEditMode ? await getMyRouteById(routeIdParam) : null

  if (isEditMode && !routeToEdit) notFound()

  const cityResult = cityParam
    ? await getInterestPlacesByNameCached(cityParam)
    : null
  const routeCenter = routeToEdit?.places[0]
    ? getPlaceCoords(routeToEdit.places[0])
    : null
  let fallbackPlaces: OSMElement[] = []

  if (routeCenter) {
    try {
      fallbackPlaces = await getInterestPlacesByCoordsCached(
        routeCenter[0],
        routeCenter[1],
      )
    } catch {
      fallbackPlaces = []
    }
  }

  const mapCoords = cityResult?.coords ?? routeCenter
  const mapPlaces = routeToEdit
    ? mergePlaces(routeToEdit.places, cityResult?.places ?? fallbackPlaces)
    : cityResult?.places ?? []

  if (!mapCoords || mapPlaces.length === 0) notFound()

  const firstImage = mapPlaces.find(
    (place) => typeof place.tags.image === 'string',
  )
  const firstWikiTag = mapPlaces.find((place) => place.tags.wikipedia)?.tags
    .wikipedia
  const heroImage =
    routeToEdit?.image ||
    firstImage?.tags.image ||
    (firstWikiTag
      ? (await locationsService.getWikiInfo(firstWikiTag))?.thumbnail?.source
      : null)

  return (
    <main className="w-full h-full p-4">
      <div>
        <div
          className="relative flex min-h-[300px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 pb-12 rounded-xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("${heroImage || '/museo_placeholder.jpg'}")`,
          }}
        >
          <div className="flex flex-col gap-3 text-left z-10">
            <span className="text-white/80 uppercase tracking-widest text-xs font-bold">
              {isEditMode ? 'Ajusta tu aventura' : 'Disena tu aventura'}
            </span>
            <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tight font-serif">
              {isEditMode ? 'Editor de Rutas' : 'Creador de Rutas'}
            </h1>
            <h2 className="text-white/90 text-base font-normal leading-relaxed max-w-[400px]">
              {isEditMode
                ? 'Modifica paradas y orden para mejorar tu recorrido.'
                : 'Selecciona los mejores lugares y crea una experiencia inolvidable.'}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AddToRouteMap
          places={mapPlaces}
          coords={mapCoords}
          city={cityResult?.city}
          routeId={routeToEdit?.id}
          initialRouteName={routeToEdit?.name}
          initialRoutePlaces={routeToEdit?.places}
          initialImage={routeToEdit?.image}
        />
      </div>
    </main>
  )
}
