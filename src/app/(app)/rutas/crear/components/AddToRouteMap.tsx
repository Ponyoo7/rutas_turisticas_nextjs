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
  ROUTE_IMAGE_ACCEPT,
} from '@/shared/consts/routes'
import { locationsService } from '@/shared/services/locations.service'
import { OSMAddress, OSMElement, WikiData } from '@/shared/types/locations'
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
  cityInfo?: WikiData | null
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

export const AddToRouteMap = ({
  places,
  coords,
  city,
  cityInfo,
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
  const previewImage =
    selectedCoverImage?.image ||
    initialImage ||
    locationsService.toRenderableImageUrl(cityInfo?.thumbnail?.source)
  const routeHeading =
    routeName.trim() || city?.name || (isEditMode ? 'Ruta en edicion' : 'Nueva ruta')
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

      const wikiCity =
        cityInfo ??
        (city ? await locationsService.getWikiInfo(`es:${city.name}`) : null)

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
    const input = event.currentTarget
    const scrollContainer =
      input.closest<HTMLElement>('[data-app-scroll-container]') ??
      (document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : null)
    const scrollTopBeforeUpload = scrollContainer?.scrollTop ?? 0
    const restoreScrollPosition = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollTopBeforeUpload
          }
          input.blur()
        })
      })
    }
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
      restoreScrollPosition()
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
    <div className="flex flex-col gap-8 pb-10">
      <section className="overflow-hidden bg-white p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit bg-[#faf8f4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
              Explorador de paradas
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f6f8] px-4 py-2 text-sm font-semibold text-artis-primary shadow-sm">
              <IconMapPin size={16} />
              {places.length} lugares en el mapa
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f6f8] px-4 py-2 text-sm font-semibold text-artis-primary shadow-sm">
              <IconRoute2 size={16} />
              {routePlaces.length} en tu ruta
            </span>
          </div>
        </div>

        <div className="overflow-hidden  bg-white p-3 md:p-4">
          <MapWrapper
            places={places}
            coords={coords}
            onClick={addPlaceToRoute}
            routePlaces={routePlaces}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[24px] bg-[#faf8f4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-artis-primary shadow-[0_14px_28px_-24px_rgba(83,61,45,0.45)]">
              <IconRoute2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-artis-primary">
                Organiza tu ruta
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-artis-primary shadow-sm">
              {routePlaces.length} parada{routePlaces.length === 1 ? '' : 's'}
            </span>
            {routePlaces.length > 1 && (
              <Button
                type="button"
                onClick={reorganizeRoute}
                variant="outline"
                className="h-11 rounded-[16px] border border-[#dfd2c3] bg-white px-5 font-semibold text-artis-primary shadow-[0_14px_28px_-24px_rgba(83,61,45,0.55)] hover:border-[#c9b49e] hover:bg-[#faf8f4]"
              >
                Reorganizar por proximidad
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <article className="rounded-[30px] border border-[#ece4d7] bg-white p-6 shadow-[0_20px_45px_-36px_rgba(83,61,45,0.24)] md:p-7">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <div className="space-y-2">
                  <span className="inline-flex w-fit rounded-full bg-[#faf8f4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
                    Identidad de la ruta
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-artis-primary">
                      {isEditMode ? 'Actualiza los detalles' : 'Presenta tu ruta'}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                 <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/55">
                      Nombre de la ruta
                    </label>
                    <span
                      aria-hidden="true"
                      className="invisible text-xs font-medium"
                    >
                      000/000
                    </span>
                  </div>
                  <Input
                    placeholder="Ej. Paseo historico por el centro"
                    value={routeName}
                    onChange={(event) => setRouteName(event.target.value)}
                    className="h-14 rounded-[22px] border border-[#d9dfe7] bg-[#f5f6f8] px-5 text-lg font-semibold text-artis-primary shadow-none focus-visible:border-artis-primary/35 focus-visible:ring-2 focus-visible:ring-artis-primary/12"
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
                        event.target.value.slice(
                          0,
                          MAX_ROUTE_DESCRIPTION_LENGTH,
                        ),
                      )
                    }
                    className="min-h-40 rounded-[24px] border border-[#d9dfe7] bg-[#f5f6f8] px-5 py-4 text-sm leading-7 text-gray-700 shadow-none focus-visible:border-artis-primary/35 focus-visible:ring-2 focus-visible:ring-artis-primary/12"
                  />
                </div>

              </div>

              <div className="rounded-[26px] bg-[#fbfcfd] p-4 md:p-5">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.92fr)_320px] xl:items-start">
                    <div className="max-w-[460px] overflow-hidden rounded-[24px] bg-white shadow-[0_14px_30px_-24px_rgba(83,61,45,0.24)]">
                      <div className="relative h-56 bg-[#edf1f5] md:h-60">
                        {previewImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewImage}
                            alt="Vista previa de la portada de la ruta"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eef2f6] via-[#fafbfd] to-[#dfe7ef] text-artis-primary/60">
                            <IconPhoto size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937]/86 via-[#1f2937]/18 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 text-white">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">
                              Portada
                            </p>
                            <p className="mt-2 max-w-[18rem] text-lg font-semibold leading-6">
                              {routeHeading}
                            </p>
                            <p className="mt-1 max-w-[18rem] text-sm leading-6 text-white/80">
                              {selectedCoverImage
                                ? 'Portada candidata'
                                : previewImage
                                  ? 'Portada provisional'
                                  : 'Todavia sin portada'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/55">
                          Galeria
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-artis-primary">
                          Imagenes aportadas durante la ruta
                        </h4>
                      </div>

                      <div className="flex flex-col gap-2.5">
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
                            tabIndex={-1}
                            onChange={handleImageChange}
                            onFocus={(focusEvent) => focusEvent.currentTarget.blur()}
                            disabled={!canUploadMoreImages || isSaving}
                          />
                        </label>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearCoverSelection}
                          disabled={routeImages.every((image) => !image.selectedForCover)}
                          className="rounded-full border-0 bg-white text-artis-primary shadow-none hover:bg-[#eef2f6]"
                        >
                          Quitar seleccion de portada
                        </Button>
                      </div>

                      {imageError && (
                        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                          {imageError}
                        </p>
                      )}
                    </div>
                  </div>

                  {routeImages.length === 0 ? (
                    <div className="rounded-[22px] bg-white px-4 py-8 text-center text-sm text-gray-500">
                      Aun no has anadido imagenes.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {routeImages.map((image) => {
                        const reviewTone = getRouteImageReviewTone(
                          image.reviewStatus,
                        )

                        return (
                          <article
                            key={image.clientId}
                            className="overflow-hidden rounded-[24px] bg-white"
                          >
                            <div className="relative h-40 bg-[#edf1f5]">
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
                                    ? getRouteImageReviewDescription(
                                        image.reviewStatus,
                                      )
                                    : 'Se enviara a revision cuando guardes la ruta.'}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  type="button"
                                  variant={
                                    image.selectedForCover ? 'default' : 'outline'
                                  }
                                  onClick={() =>
                                    toggleCoverSelection(image.clientId)
                                  }
                                  className={
                                    image.selectedForCover
                                      ? 'rounded-full bg-artis-primary text-white hover:bg-artis-primary/90'
                                      : 'rounded-full border-0 bg-[#f5f6f8] text-artis-primary shadow-none hover:bg-[#eef2f6]'
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
                                    onClick={() =>
                                      removeUnsavedImage(image.clientId)
                                    }
                                    className="rounded-full border-0 bg-rose-50 text-rose-700 shadow-none hover:bg-rose-100"
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

              <div className="flex flex-col items-center gap-3 border-t border-[#ece4d7] pt-5">
                <div className="w-full max-w-sm">
                  <Button
                    onClick={handleSave}
                    disabled={!canSaveRoute}
                    className="h-14 w-full rounded-[22px] bg-artis-primary px-6 text-base font-bold text-white shadow-[0_18px_30px_-18px_rgba(83,61,45,0.7)] transition-colors hover:bg-artis-primary/90 disabled:bg-gray-300"
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
                  <p className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </p>
                )}
              </div>
            </div>
          </article>
        </section>

        <aside className="self-start xl:sticky xl:top-6">
          <div className="flex flex-col gap-5">
            <section className="rounded-[30px] border border-[#ece4d7] bg-white p-5 shadow-[0_20px_45px_-36px_rgba(83,61,45,0.24)]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <span className="inline-flex w-fit rounded-full bg-[#faf8f4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.26em] text-artis-primary/70">
                    Itinerario
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-artis-primary">
                      Paradas seleccionadas
                    </h3>
            
                  </div>
                </div>

                {routePlaces.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[#d9dfe7] bg-[linear-gradient(180deg,#fbfcfd_0%,#f8f2e8_100%)] px-6 py-12 text-center">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-artis-primary/60 shadow-sm">
                      Empieza en el mapa
                    </span>
                    <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-artis-primary shadow-sm">
                      <IconMapPin size={28} />
                    </div>
                    <p className="mt-5 font-serif text-3xl font-bold text-artis-primary">
                      Empieza a construir la ruta
                    </p>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-600">
                      Toca lugares en el mapa para empezar el itinerario.
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
            </section>

          </div>
        </aside>
      </div>
    </div>
  )
}
