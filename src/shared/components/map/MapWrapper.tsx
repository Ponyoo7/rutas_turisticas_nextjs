'use client'

import dynamic from 'next/dynamic'
import { IconDeviceWatch, IconWalk } from '@tabler/icons-react'
import { MapSearch } from '../../../app/(app)/ciudad/[name]/components/MapSearch'
import { formatDuration, getRouteStats } from '@/lib/utils'
import { OSMElement } from '@/shared/types/locations'
import { useMapSearch } from './hooks/useMapSearch'

const MapNoSSR = dynamic(() => import('@/shared/components/map/Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse rounded-xl bg-gray-100" />,
})

interface Props {
  places: OSMElement[]
  coords: number[] | null
  onClick?: (place: OSMElement) => void
  routePlaces?: OSMElement[]
  isLoading?: boolean
  isRefreshing?: boolean
  statusMessage?: string | null
  errorMessage?: string | null
  emptyStateTitle?: string
  emptyStateDescription?: string
}

export const MapWrapper = ({
  places,
  coords,
  onClick,
  routePlaces,
  isLoading = false,
  isRefreshing = false,
  statusMessage = null,
  errorMessage = null,
  emptyStateTitle,
  emptyStateDescription,
}: Props) => {
  const {
    search,
    setSearch,
    flyTo,
    setFlyTo,
    filteredPlaces,
    handleSelectPlace,
  } = useMapSearch(places)
  const routeStats = getRouteStats(routePlaces ?? [])
  const hasPlaces = places.length > 0
  const hasCoords = Array.isArray(coords) && coords.length === 2
  const shouldShowOverlay =
    Boolean(statusMessage) ||
    Boolean(errorMessage) ||
    (!hasPlaces && !isLoading && Boolean(emptyStateTitle))

  return (
    <div className="relative mt-4">
      <MapSearch
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setFlyTo(null)
        }}
        filteredPlaces={filteredPlaces}
        onSelectPlace={handleSelectPlace}
        disabled={!hasPlaces}
        placeholder={
          isLoading || isRefreshing
            ? 'Estamos preparando los puntos turisticos...'
            : hasCoords
              ? 'Los resultados apareceran aqui cuando haya puntos disponibles'
              : 'Primero centraremos el mapa de la ciudad'
        }
      />

      <div className="relative">
        {routePlaces && routePlaces.length > 1 && (
          <div className="absolute right-2 top-2 z-[1000] flex w-fit flex-col gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <IconWalk /> {routeStats.totalDistanceKm} km
            </span>
            <span className="flex items-center gap-1">
              <IconDeviceWatch /> {formatDuration(routeStats.totalMinutes)}
            </span>
          </div>
        )}

        {shouldShowOverlay && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-sm rounded-2xl border border-artis-primary/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            {errorMessage ? (
              <>
                <p className="text-sm font-bold text-artis-primary">
                  El mapa sigue disponible
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {errorMessage}
                </p>
              </>
            ) : !hasPlaces && !isLoading && emptyStateTitle ? (
              <>
                <p className="text-sm font-bold text-artis-primary">
                  {emptyStateTitle}
                </p>
                {emptyStateDescription && (
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {emptyStateDescription}
                  </p>
                )}
              </>
            ) : statusMessage ? (
              <>
                <p className="text-sm font-bold text-artis-primary">
                  {isLoading ? 'Cargando puntos turisticos' : 'Mapa listo'}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {statusMessage}
                </p>
              </>
            ) : null}
          </div>
        )}

        <MapNoSSR
          places={places}
          zoom={15}
          coords={coords}
          flyTo={flyTo}
          onClick={onClick}
          routePlaces={routePlaces}
        />
      </div>
    </div>
  )
}
