'use client'

import {
  getRouteImageReviewDescription,
  getRouteImageReviewLabel,
  getRouteImageReviewTone,
  prepareRouteUploadImage,
} from '@/lib/route-images'
import { getDistanceKm } from '@/lib/utils'
import { saveRoute, updateRoute } from '@/actions/routes.actions'
import { MapWrapper } from '@/shared/components/map/MapWrapper'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  MAX_ROUTE_CONTRIBUTED_IMAGES,
  MAX_ROUTE_DESCRIPTION_LENGTH,
  MAX_ROUTE_IMAGE_UPLOAD_BYTES,
  ROUTE_IMAGE_ACCEPT,
} from '@/shared/consts/routes'
import { locationsService } from '@/shared/services/locations.service'
import { OSMAddress, OSMElement } from '@/shared/types/locations'
import { RouteImage, RouteImageReviewStatus } from '@/shared/types/routes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  IconLoader2,
  IconMapPin,
  IconPhoto,
  IconRoute2,
  IconStar,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { PlaceCard } from './PlaceCard'

interface Props {
  places: OSMElement[]
  coords: number[]
  city?: OSMAddress
  routeId?: number
  initialRouteName?: string
  initialRouteDescription?: string
  initialRoutePlaces?: OSMElement[]
  initialImage?: string
  initialRouteImages?: RouteImage[]
}

type EditableRouteImage = {
  clientId: string
  id?: number
  image: string
  reviewStatus: RouteImageReviewStatus
  selectedForCover: boolean
  persisted: boolean
}

const createClientId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const getCoverSelectionMessage = (image?: EditableRouteImage) => {
  if (!image) {
    return 'La portada seguira siendo la actual hasta que selecciones una imagen de la galeria.'
  }

  if (image.reviewStatus === 'approved') {
    return 'Esta imagen ya esta aprobada y pasara a ser la portada al guardar la ruta.'
  }

  if (image.reviewStatus === 'rejected') {
    return 'Esta imagen esta marcada como portada, pero fue rechazada por el administrador.'
  }

  return 'Esta imagen esta marcada como portada candidata y se aplicara cuando el administrador la apruebe.'
}

export const AddToRouteMap = ({
  places,
  coords,
  city,
  routeId,
  initialRouteName = '',
  initialRouteDescription = '',
  initialRoutePlaces = [],
  initialImage = '',
  initialRouteImages = [],
}: Props) => {
  const router = useRouter()
  const isEditMode = typeof routeId === 'number'
  const [isSaving, setIsSaving] = useState(false)
  const [isPreparingImage, setIsPreparingImage] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const [routePlaces, setRoutePlaces] =
    useState<OSMElement[]>(initialRoutePlaces)
  const [routeName, setRouteName] = useState<string>(initialRouteName)
  const [routeDescription, setRouteDescription] =
    useState<string>(initialRouteDescription)
  const [routeImages, setRouteImages] = useState<EditableRouteImage[]>(
    initialRouteImages.map((image) => ({
      clientId: `existing-${image.id}`,
      id: image.id,
      image: image.image,
      reviewStatus: image.reviewStatus,
      selectedForCover: image.selectedForCover,
      persisted: true,
    })),
  )

  const selectedCoverImage =
    routeImages.find((image) => image.selectedForCover) ?? null
  const previewImage = selectedCoverImage?.image || initialImage
  const canUploadMoreImages =
    routeImages.length < MAX_ROUTE_CONTRIBUTED_IMAGES && !isPreparingImage
  const canSaveRoute =
    routeName.trim().length > 0 &&
    routePlaces.length > 0 &&
    !isSaving &&
    !isPreparingImage

  const addPlaceToRoute = (place: OSMElement) => {
    if (routePlaces.some((p) => p.id === place.id)) return
    const newRoutePlaces = [...routePlaces, place]
    setRoutePlaces(newRoutePlaces)
  }

  const reorganizeRoute = () => {
    if (routePlaces.length <= 2) return

    const original = [...routePlaces]
    const reordered = [original.shift() as OSMElement]

    while (original.length > 0) {
      const last = reordered[reordered.length - 1]
      let nearestIndex = 0
      let minDistance = getDistanceKm(last, original[0])

      for (let index = 1; index < original.length; index++) {
        const distance = getDistanceKm(last, original[index])
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = index
        }
      }

      reordered.push(original.splice(nearestIndex, 1)[0])
    }

    setRoutePlaces(reordered)
  }

  const removePlace = (placeId: number) => {
    const newRoutePlaces = routePlaces.filter(
      (routePlace) => routePlace.id !== placeId,
    )

    setRoutePlaces(newRoutePlaces)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const contributedImages = routeImages.map((image) => ({
        id: image.id,
        image: image.image,
        selectedForCover: image.selectedForCover,
      }))

      if (isEditMode && routeId) {
        await updateRoute({
          id: routeId,
          name: routeName,
          description: routeDescription,
          places: routePlaces,
          contributedImages,
        })

        router.replace(`/rutas/${routeId}`)
        return
      }

      const wikiCity = city
        ? await locationsService.getWikiInfo(`es:${city.name}`)
        : null

      const createdRouteId = await saveRoute({
        name: routeName,
        description: routeDescription,
        places: routePlaces,
        image: wikiCity?.thumbnail?.source ?? initialImage,
        contributedImages,
      })

      if (createdRouteId) {
        router.replace(`/rutas/${createdRouteId}`)
        return
      }

      router.replace('/')
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la ruta. Intentalo de nuevo.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) return

    setIsPreparingImage(true)
    setImageError(null)
    setSaveError(null)

    try {
      const availableSlots = MAX_ROUTE_CONTRIBUTED_IMAGES - routeImages.length

      if (availableSlots <= 0) {
        throw new Error(
          `Ya has alcanzado el maximo de ${MAX_ROUTE_CONTRIBUTED_IMAGES} imagenes para esta ruta.`,
        )
      }

      const preparedImages = await Promise.all(
        files.slice(0, availableSlots).map(async (file) => ({
          clientId: createClientId(),
          image: await prepareRouteUploadImage(file),
          reviewStatus: 'pending' as RouteImageReviewStatus,
          selectedForCover: false,
          persisted: false,
        })),
      )

      setRouteImages((currentImages) => [...currentImages, ...preparedImages])
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : 'No se pudieron preparar las imagenes seleccionadas.',
      )
    } finally {
      event.target.value = ''
      setIsPreparingImage(false)
    }
  }

  const toggleCoverSelection = (clientId: string) => {
    setRouteImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        selectedForCover:
          image.clientId === clientId ? !image.selectedForCover : false,
      })),
    )
  }

  const clearCoverSelection = () => {
    setRouteImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        selectedForCover: false,
      })),
    )
  }

  const removeUnsavedImage = (clientId: string) => {
    setRouteImages((currentImages) =>
      currentImages.filter(
        (image) => image.clientId !== clientId || image.persisted,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="overflow-hidden rounded-[30px] border border-[#eadfce] bg-white p-4 shadow-[0_24px_70px_-48px_rgba(92,58,14,0.45)] md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
              Diseno de recorrido
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-artis-primary md:text-3xl">
                Construye la ruta en el mapa
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                Toca lugares para anadirlos al itinerario y luego ajusta el
                orden, la descripcion y las imagenes para dejarlo todo listo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-artis-primary">
              <IconMapPin size={16} />
              {places.length} lugares en el mapa
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-artis-primary">
              <IconRoute2 size={16} />
              {routePlaces.length} en tu ruta
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#eee3d4] bg-[#f9f4ec] p-1">
          <MapWrapper
            places={places}
            coords={coords}
            onClick={addPlaceToRoute}
            routePlaces={routePlaces}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.95fr)]">
        <section className="flex min-w-0 flex-col gap-6">
          <article className="rounded-[30px] border border-[#eadfce] bg-white p-6 shadow-[0_24px_70px_-48px_rgba(92,58,14,0.45)] md:p-7">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex w-fit rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
                    Identidad de la ruta
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-artis-primary">
                      {isEditMode ? 'Actualiza los detalles' : 'Presenta tu ruta'}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                      Define un nombre claro y una descripcion que explique el
                      estilo del recorrido y lo que la gente encontrara en el
                      camino.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:w-fit sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#fcfaf7] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                      Estado
                    </p>
                    <p className="mt-1 text-sm font-bold text-artis-primary">
                      {isEditMode ? 'Edicion' : 'Nueva'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#fcfaf7] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                      Paradas
                    </p>
                    <p className="mt-1 text-sm font-bold text-artis-primary">
                      {routePlaces.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#fcfaf7] p-3 col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                      Galeria
                    </p>
                    <p className="mt-1 text-sm font-bold text-artis-primary">
                      {routeImages.length}/{MAX_ROUTE_CONTRIBUTED_IMAGES}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/55">
                    Nombre de la ruta
                  </label>
                  <Input
                    placeholder="Ej. Paseo historico por el centro"
                    value={routeName}
                    onChange={(event) => setRouteName(event.target.value)}
                    className="h-14 rounded-2xl border-[#dfcfba] bg-[#fffdf9] px-5 text-lg font-semibold text-artis-primary shadow-none focus-visible:border-artis-primary/40 focus-visible:ring-artis-primary/15"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/55">
                      Descripcion
                    </label>
                    <span className="text-xs font-medium text-gray-500">
                      {routeDescription.length}/{MAX_ROUTE_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Anade una descripcion breve para presentar la ruta, su estilo o el tipo de visita recomendada."
                    value={routeDescription}
                    onChange={(event) =>
                      setRouteDescription(
                        event.target.value.slice(0, MAX_ROUTE_DESCRIPTION_LENGTH),
                      )
                    }
                    className="min-h-40 rounded-[24px] border-[#e7d9c6] bg-[#fcfaf7] px-5 py-4 text-sm leading-7 text-gray-700 shadow-none focus-visible:border-artis-primary/35 focus-visible:ring-artis-primary/15"
                  />
                  <p className="text-xs leading-5 text-gray-500">
                    Esta descripcion se mostrara en el detalle publico y en el
                    perfil del autor.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-[24px] border border-[#eee3d4] bg-[#fffaf4] p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {routePlaces.length > 1 && (
                    <Button
                      onClick={reorganizeRoute}
                      variant="outline"
                      className="rounded-full border-[#d9c8b2] bg-white px-5 font-semibold text-artis-primary shadow-none hover:bg-[#fff2df]"
                    >
                      Reorganizar por proximidad
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!canSaveRoute}
                  className="rounded-full bg-artis-primary px-6 font-bold text-white shadow-lg transition-colors hover:bg-artis-primary/90 disabled:bg-gray-300"
                >
                  {isSaving ? (
                    <>
                      <IconLoader2 className="animate-spin" />
                      Guardando...
                    </>
                  ) : isEditMode ? (
                    'Actualizar ruta'
                  ) : (
                    'Guardar ruta'
                  )}
                </Button>
              </div>

              {saveError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[30px] border border-[#eadfce] bg-white p-6 shadow-[0_24px_70px_-48px_rgba(92,58,14,0.45)] md:p-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex w-fit rounded-full bg-[#fff7ed] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
                    Itinerario
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-artis-primary">
                      Paradas seleccionadas
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                      Revisa el recorrido final y elimina las paradas que no
                      encajen. El orden se refleja en el detalle de la ruta.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit rounded-full border border-[#eadfce] bg-[#fffaf4] px-4 py-2 text-sm font-semibold text-artis-primary">
                  {routePlaces.length} parada{routePlaces.length === 1 ? '' : 's'}
                </span>
              </div>

              {routePlaces.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-[#dfcfba] bg-[#fcfaf7] px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff2df] text-artis-primary">
                    <IconMapPin size={24} />
                  </div>
                  <p className="mt-4 font-serif text-2xl font-bold text-artis-primary">
                    Empieza a construir la ruta
                  </p>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
                    Toca sitios en el mapa para anadirlos a tu itinerario. Aqui
                    apareceran ordenados y listos para revisarlos.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {routePlaces.map((routePlace, index) => (
                    <PlaceCard
                      key={routePlace.id}
                      place={routePlace}
                      index={index + 1}
                      onDelete={removePlace}
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="self-start xl:sticky xl:top-6">
          <div className="overflow-hidden rounded-[30px] border border-[#eadfce] bg-white shadow-[0_24px_70px_-48px_rgba(92,58,14,0.45)]">
            <div className="relative h-64 bg-[#efe4d2]">
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImage}
                  alt="Vista previa de la portada de la ruta"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eadbc6] via-[#f8f2ea] to-[#d9ccb7] text-artis-primary/60">
                  <IconPhoto size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2f1707]/85 via-[#2f1707]/15 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">
                    Portada
                  </p>
                  <p className="mt-2 max-w-[18rem] text-sm font-semibold leading-6">
                    {selectedCoverImage
                      ? 'Vista previa de la candidata a portada'
                      : previewImage
                        ? 'Portada actual de la ruta'
                        : 'Todavia no hay portada definida'}
                  </p>
                </div>
                {selectedCoverImage ? (
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
                    Candidata
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                    Fotos
                  </p>
                  <p className="mt-1 text-sm font-bold text-artis-primary">
                    {routeImages.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                    Portada
                  </p>
                  <p className="mt-1 text-sm font-bold text-artis-primary">
                    {selectedCoverImage ? 'Elegida' : 'Actual'}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                    Limite
                  </p>
                  <p className="mt-1 text-sm font-bold text-artis-primary">
                    {MAX_ROUTE_CONTRIBUTED_IMAGES}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold text-artis-primary">
                  Imagenes aportadas durante la ruta
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Sube una o varias fotos tomadas durante la experiencia. El
                  administrador las revisara desde Gestion de imagenes.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {getCoverSelectionMessage(selectedCoverImage ?? undefined)}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition-colors ${
                    canUploadMoreImages
                      ? 'cursor-pointer bg-artis-primary hover:bg-artis-primary/90'
                      : 'cursor-not-allowed bg-gray-300'
                  }`}
                >
                  {isPreparingImage ? (
                    <>
                      <IconLoader2 className="animate-spin" size={18} />
                      Preparando imagenes...
                    </>
                  ) : (
                    <>
                      <IconUpload size={18} />
                      Subir imagenes
                    </>
                  )}
                  <input
                    type="file"
                    accept={ROUTE_IMAGE_ACCEPT}
                    multiple
                    className="sr-only"
                    onChange={handleImageChange}
                    disabled={!canUploadMoreImages || isSaving}
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearCoverSelection}
                  disabled={routeImages.every((image) => !image.selectedForCover)}
                  className="rounded-full border-[#d9c8b2] bg-white text-artis-primary shadow-none hover:bg-[#fff2df]"
                >
                  Quitar seleccion de portada
                </Button>
              </div>

              <p className="text-xs leading-5 text-gray-500">
                JPG, PNG o WebP. Se optimizan automaticamente antes de
                guardarse y cada una se limita a unos{' '}
                {Math.round(MAX_ROUTE_IMAGE_UPLOAD_BYTES / 1024)} KB. Maximo:{' '}
                {MAX_ROUTE_CONTRIBUTED_IMAGES} imagenes.
              </p>

              {imageError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {imageError}
                </p>
              )}

              {routeImages.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#dfcfba] bg-[#fcfaf7] px-4 py-10 text-center text-sm text-gray-500">
                  Todavia no has anadido imagenes aportadas por la ruta.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {routeImages.map((image) => {
                    const reviewTone = getRouteImageReviewTone(image.reviewStatus)

                    return (
                      <article
                        key={image.clientId}
                        className="overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fcfaf7]"
                      >
                        <div className="relative h-40 bg-[#efe4d2]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.image}
                            alt="Imagen aportada por la ruta"
                            className="h-full w-full object-cover"
                          />
                          {image.selectedForCover && (
                            <span className="absolute left-3 top-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-artis-primary">
                              Portada
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 p-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                                reviewTone === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : reviewTone === 'rejected'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {image.persisted
                                ? getRouteImageReviewLabel(image.reviewStatus)
                                : 'Pendiente de guardar'}
                            </span>
                            <p className="text-xs leading-5 text-gray-500">
                              {image.persisted
                                ? getRouteImageReviewDescription(image.reviewStatus)
                                : 'Se enviara a revision cuando guardes la ruta.'}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant={
                                image.selectedForCover ? 'default' : 'outline'
                              }
                              onClick={() => toggleCoverSelection(image.clientId)}
                              className={
                                image.selectedForCover
                                  ? 'rounded-full bg-artis-primary text-white hover:bg-artis-primary/90'
                                  : 'rounded-full border-[#d9c8b2] bg-white text-artis-primary shadow-none hover:bg-[#fff2df]'
                              }
                            >
                              <IconStar size={16} />
                              {image.selectedForCover
                                ? 'Quitar de portada'
                                : 'Usar como portada'}
                            </Button>

                            {!image.persisted && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeUnsavedImage(image.clientId)}
                                className="rounded-full border-rose-200 bg-white text-rose-700 shadow-none hover:bg-rose-50"
                              >
                                <IconTrash size={16} />
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
