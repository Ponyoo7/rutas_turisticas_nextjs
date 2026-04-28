'use client'

import { startTransition, useEffect, useState } from 'react'
import { MapWrapper } from '@/shared/components/map/MapWrapper'
import { InterestPlacesResponse } from '@/shared/types/interest-places'
import { OSMElement } from '@/shared/types/locations'
import { RelevantPlaces } from './RelevantPlaces'
import { VerifiedRoutes } from './VerifiedRoutes'

interface Props {
  cityName: string
  initialCoords: [number, number] | null
  initialPlaces: OSMElement[]
  initialSource: InterestPlacesResponse['source']
  initialStale?: boolean
}

type CityMapClientState = InterestPlacesResponse & {
  errorMessage: string | null
  isLoading: boolean
  isRefreshing: boolean
}

const LOW_RESULTS_NOTICE_THRESHOLD = 5

const buildInitialState = ({
  cityName,
  initialCoords,
  initialPlaces,
  initialSource,
  initialStale,
}: Props): CityMapClientState => ({
  city: cityName,
  coords: initialCoords,
  places: initialPlaces,
  source: initialSource,
  stale: initialStale,
  errorMessage: null,
  isLoading: initialPlaces.length === 0,
  isRefreshing: initialPlaces.length > 0,
})

const getMapStatusMessage = (
  state: CityMapClientState,
  hasCoords: boolean,
) => {
  if (state.isLoading) {
    return 'El mapa ya esta visible. Estamos pidiendo los puntos turisticos en segundo plano.'
  }

  if (state.isRefreshing) {
    return 'Mostrando datos guardados mientras actualizamos la ciudad.'
  }

  if (
    state.places.length > 0 &&
    state.places.length < LOW_RESULTS_NOTICE_THRESHOLD
  ) {
    return 'Mostrando una seleccion inicial de lugares. Seguimos buscando mas puntos...'
  }

  if (state.stale) {
    return 'Se ha mostrado una copia guardada para no bloquear la experiencia.'
  }

  if (state.source === 'cache') {
    return 'Hemos usado una copia local para que el mapa aparezca antes.'
  }

  if (state.places.length > 0) {
    return `${state.places.length} puntos turisticos listos para explorar.`
  }

  if (hasCoords) {
    return 'No se pudieron cargar puntos turisticos ahora mismo. Prueba de nuevo en unos segundos.'
  }

  return null
}

export const CityMapClient = (props: Props) => {
  const { cityName, initialCoords, initialPlaces, initialSource, initialStale } =
    props
  const [state, setState] = useState<CityMapClientState>(() =>
    buildInitialState(props),
  )

  useEffect(() => {
    const controller = new AbortController()

    startTransition(() => {
      setState(
        buildInitialState({
          cityName,
          initialCoords,
          initialPlaces,
          initialSource,
          initialStale,
        }),
      )
    })

    const loadPlaces = async () => {
      try {
        const response = await fetch(
          `/api/interest-places?city=${encodeURIComponent(cityName)}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error('No pudimos recuperar los puntos turisticos.')
        }

        const payload = (await response.json()) as InterestPlacesResponse

        startTransition(() => {
          setState((currentState) => ({
            city: payload.city || cityName,
            coords: payload.coords ?? currentState.coords,
            places: payload.places,
            source: payload.source,
            stale: payload.stale,
            errorMessage: null,
            isLoading: false,
            isRefreshing: false,
          }))
        })
      } catch (error) {
        if (controller.signal.aborted) return

        startTransition(() => {
          setState((currentState) => ({
            ...currentState,
            errorMessage:
              error instanceof Error
                ? 'No pudimos actualizar los puntos ahora mismo, pero puedes seguir navegando por la ciudad.'
                : 'Ha ocurrido un error al cargar los puntos turisticos.',
            isLoading: false,
            isRefreshing: false,
          }))
        })
      }
    }

    void loadPlaces()

    return () => {
      controller.abort()
    }
  }, [
    cityName,
    initialCoords,
    initialPlaces,
    initialSource,
    initialStale,
  ])

  const hasPlaces = state.places.length > 0
  const hasCoords = Array.isArray(state.coords) && state.coords.length === 2

  return (
    <div className="grid grid-cols-1">
      <div className="flex flex-col gap-4 px-4 pb-4 lg:col-span-8">
        <div className="relative overflow-hidden bg-white">
          <MapWrapper
            places={state.places}
            coords={state.coords}
            isLoading={state.isLoading}
            isRefreshing={state.isRefreshing}
            statusMessage={getMapStatusMessage(state, hasCoords)}
            errorMessage={state.errorMessage}
            emptyStateTitle="No hemos podido ubicar la ciudad con precision todavia"
            emptyStateDescription={
              hasCoords
                ? 'Si recibimos nuevos lugares, apareceran aqui automaticamente sin bloquear la pagina.'
                : 'Estamos intentando centrar la ciudad y obtener sus lugares de interes.'
            }
          />
        </div>

        <VerifiedRoutes
          name={cityName}
          enabled={hasPlaces}
          isLoadingPlaces={state.isLoading || state.isRefreshing}
        />

        <RelevantPlaces
          places={state.places}
          isLoading={state.isLoading || state.isRefreshing}
          errorMessage={state.errorMessage}
        />
      </div>
    </div>
  )
}
