'use client'

import { startTransition, useEffect, useState } from 'react'
import { FeaturedRouteCard } from '@/app/(app)/components/FeaturedRouteCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { CityVerifiedRoutesResponse } from '@/shared/types/interest-places'

interface Props {
  name: string
  enabled: boolean
  isLoadingPlaces?: boolean
}

type VerifiedRoutesState = CityVerifiedRoutesResponse & {
  errorMessage: string | null
  isLoading: boolean
}

const buildInitialState = (cityName: string): VerifiedRoutesState => ({
  city: cityName,
  routes: [],
  favoriteRouteIds: [],
  errorMessage: null,
  isLoading: false,
})

const VerifiedRoutesSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="h-72 animate-pulse rounded-[24px] bg-gray-100"
      />
    ))}
  </div>
)

export const VerifiedRoutes = ({
  name,
  enabled,
  isLoadingPlaces = false,
}: Props) => {
  const [state, setState] = useState<VerifiedRoutesState>(() =>
    buildInitialState(name),
  )

  useEffect(() => {
    const controller = new AbortController()

    startTransition(() => {
      setState({
        ...buildInitialState(name),
        isLoading: enabled,
      })
    })

    if (!enabled) {
      return () => {
        controller.abort()
      }
    }

    const loadRoutes = async () => {
      try {
        const response = await fetch(
          `/api/verified-routes?city=${encodeURIComponent(name)}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error('No pudimos recuperar las rutas verificadas.')
        }

        const payload = (await response.json()) as CityVerifiedRoutesResponse

        startTransition(() => {
          setState({
            ...payload,
            errorMessage: null,
            isLoading: false,
          })
        })
      } catch (error) {
        if (controller.signal.aborted) return

        startTransition(() => {
          setState({
            ...buildInitialState(name),
            errorMessage:
              error instanceof Error
                ? 'Las rutas verificadas no estan disponibles en este momento.'
                : 'No pudimos cargar las rutas verificadas.',
            isLoading: false,
          })
        })
      }
    }

    void loadRoutes()

    return () => {
      controller.abort()
    }
  }, [enabled, name])

  const favoriteRouteIdSet = new Set(state.favoriteRouteIds)

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          Rutas verificadas
        </h2>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      {isLoadingPlaces || state.isLoading ? (
        <VerifiedRoutesSkeleton />
      ) : state.routes.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-artis-primary/20 bg-[#fcfaf7] p-8 text-center">
          <p className="font-serif text-2xl font-bold text-artis-primary">
            Todavia no hay rutas verificadas en {name}.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            {state.errorMessage
              ? state.errorMessage
              : 'Cuando publiquemos una ruta destacada para esta ciudad, aparecera aqui junto a sus paradas y su duracion estimada.'}
          </p>
        </div>
      ) : (
        <Carousel className="w-full" opts={{ align: 'start' }}>
          <CarouselContent>
            {state.routes.map(({ route, matchingPlacesCount }) => (
              <CarouselItem
                key={route.id}
                className="basis-[88%] sm:basis-[62%] lg:basis-[46%] xl:basis-[34%]"
              >
                <FeaturedRouteCard
                  route={route}
                  initialIsFavorite={favoriteRouteIdSet.has(route.id)}
                  primaryBadge="Verificada"
                  secondaryBadge={`${matchingPlacesCount} coincidencias`}
                  href={`/rutas/destacadas/${route.id}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
