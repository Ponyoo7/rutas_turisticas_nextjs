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
    heroPlace?.tags.wikipedia
      ? await locationsService.getWikiInfo(heroPlace.tags.wikipedia)
      : null
  const selectedContributedCover = routeToEdit?.contributedImages.find(
    (image) => image.selectedForCover,
  )
  const heroImage =
    selectedContributedCover?.image ||
    locationsService.toRenderableImageUrl(routeToEdit?.image) ||
    (heroPlace ? locationsService.getPlaceImage(heroPlace, heroWikiInfo) : null)

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section
          className="relative overflow-hidden rounded-[34px] border border-white/40 bg-cover bg-center bg-no-repeat px-6 pb-10 pt-24 shadow-[0_28px_90px_-42px_rgba(0,0,0,0.45)] md:px-10 md:pt-28"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(28, 18, 10, 0.25) 0%, rgba(28, 18, 10, 0.68) 65%), url("${heroImage || '/museo_placeholder.jpg'}")`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_38%)]" />

          <div className="relative flex max-w-3xl flex-col gap-4 text-left">
            <span className="inline-flex w-fit rounded-full bg-white/14 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
              {isEditMode ? 'Ajusta tu aventura' : 'Disena tu aventura'}
            </span>
            <h1 className="font-serif text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              {isEditMode ? 'Editor de Rutas' : 'Creador de Rutas'}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/90 md:text-base">
              {isEditMode
                ? 'Modifica paradas, descripcion y galeria para mejorar la experiencia final del recorrido.'
                : 'Selecciona los mejores lugares y construye una experiencia visual y bien organizada desde el primer momento.'}
            </p>
          </div>
        </section>

        <AddToRouteMap
          places={mapPlaces}
          coords={mapCoords}
          city={cityResult?.city}
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
