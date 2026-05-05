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

/**
 * Página `CrearRutaPage`
 *
 * Permite tanto la creación de nuevas rutas como la edición de rutas existentes.
 *
 * Modos de operación:
 * - Creación: Recibe el parámetro `city` para buscar lugares de interés en una ciudad.
 * - Edición: Recibe `routeId` para cargar una ruta guardada por el usuario (verificando autoría con `getMyRouteById`).
 */
export default async function CrearRutaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const cityParam = typeof params.city === 'string' ? params.city : undefined
  const routeIdParam =
    typeof params.routeId === 'string' ? Number(params.routeId) : null

  // Determinamos si estamos en "Modo Edición" y obtenemos los datos de la ruta
  const isEditMode =
    routeIdParam != null && Number.isInteger(routeIdParam) && routeIdParam > 0
  const routeToEdit = isEditMode ? await getMyRouteById(routeIdParam) : null

  if (isEditMode && !routeToEdit) notFound()

  // Obtenemos todos los lugares de interés de la ciudad objetivo si existe el parámetro city
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

  // Fusionamos los lugares que ya formaban parte de la ruta editada con
  // los nuevos lugares obtenidos por ciudad o proximidad, evitando duplicados.
  const mapPlaces = routeToEdit
    ? mergePlaces(routeToEdit.places, cityResult?.places ?? fallbackPlaces)
    : (cityResult?.places ?? [])

  if (!mapCoords || mapPlaces.length === 0) notFound()

  const heroPlace = mapPlaces.find(
    (place) => locationsService.getPlaceImage(place) || place.tags.wikipedia,
  )
  const heroWikiInfo =
    heroPlace?.wikiInfo ??
    (heroPlace?.tags.wikipedia
      ? await locationsService.getWikiInfo(heroPlace.tags.wikipedia)
      : null)
  const selectedApprovedContributedCover = routeToEdit?.contributedImages.find(
    (image) => image.selectedForCover && image.reviewStatus === 'approved',
  )
  const heroImage =
    selectedApprovedContributedCover?.image ||
    locationsService.toRenderableImageUrl(routeToEdit?.image) ||
    (heroPlace ? locationsService.getPlaceImage(heroPlace, heroWikiInfo) : null)
  const heroTitle =
    cityResult?.city.name || routeToEdit?.name || 'Creador de rutas'
  const heroSubtitle = isEditMode
    ? 'Reordena las paradas, actualiza la descripcion y deja la portada lista para publicar la mejor version del recorrido.'
    : cityResult?.city.name
      ? `Explora ${cityResult.city.name} y construye una ruta visual, clara y personalizada desde un entorno mucho mas limpio.`
      : 'Selecciona lugares, organiza el itinerario y prepara una ruta que se entienda de un vistazo.'

  return (
    <main className="min-h-full bg-white px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-8">
        <section
          className="relative overflow-hidden rounded-[32px] border border-black/5 bg-cover bg-center bg-no-repeat px-6 py-16 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.5)] md:min-h-[320px] md:px-10"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.24) 0%, rgba(15, 23, 42, 0.66) 100%), url("${heroImage || '/museo_placeholder.jpg'}")`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_42%)]" />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <h1 className="font-serif text-4xl font-black leading-[0.98] tracking-tight text-white md:text-6xl">
              {heroTitle}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/92 md:text-lg">
              {heroSubtitle}
            </p>
          </div>
        </section>

        <AddToRouteMap
          places={mapPlaces}
          coords={mapCoords}
          city={cityResult?.city}
          cityInfo={cityResult?.cityInfo}
          routeId={routeToEdit?.id}
          initialRouteName={routeToEdit?.name}
          initialRouteDescription={routeToEdit?.description}
          initialRoutePlaces={routeToEdit?.places}
          initialImage={routeToEdit?.image}
          initialRouteImages={routeToEdit?.contributedImages}
        />
      </div>
    </main>
  )
}
