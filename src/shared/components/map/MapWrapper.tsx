'use client'

import dynamic from 'next/dynamic'
import { MapSearch } from '../../../app/(app)/ciudad/[name]/components/MapSearch'
import { useMapSearch } from './hooks/useMapSearch'
import { OSMElement } from '@/shared/types/locations'
import { formatDuration, getRouteStats } from '@/lib/utils'
import { IconDeviceWatch, IconWalk } from '@tabler/icons-react'

const MapNoSSR = dynamic(() => import('@/shared/components/map/Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse" />,
})

interface Props {
  places: OSMElement[]
  coords: number[]
  onClick?: (place: OSMElement) => void
  routePlaces?: OSMElement[]
}

export const MapWrapper = ({ places, coords, onClick, routePlaces }: Props) => {
  const {
    search,
    setSearch,
    flyTo,
    setFlyTo,
    filteredPlaces,
    handleSelectPlace,
  } = useMapSearch(places)

  const routeStats = getRouteStats(routePlaces ?? [])

  return (
    <div className="relative mt-4">
      <MapSearch
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setFlyTo(null)
        }}
        filteredPlaces={filteredPlaces}
        onSelectPlace={handleSelectPlace}
      />

      <div className="relative">
        {routePlaces && routePlaces.length > 1 && (
          <div className="absolute top-2 right-2 z-1000 px-4 py-3 flex flex-col  gap-4 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg w-fit">
            <span className="flex items-center gap-1">
              <IconWalk /> {routeStats.totalDistanceKm} km
            </span>
            <span className="flex items-center gap-1">
              <IconDeviceWatch /> {formatDuration(routeStats.totalMinutes)}
            </span>
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
