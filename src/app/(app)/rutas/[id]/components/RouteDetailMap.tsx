'use client'

import dynamic from 'next/dynamic'
import { OSMElement } from '@/shared/types/locations'
import { getPlaceCoords } from '@/lib/utils'

const MapNoSSR = dynamic(() => import('@/shared/components/map/Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse rounded-xl bg-slate-100" />,
})

interface RouteDetailMapProps {
  places: OSMElement[]
}

export const RouteDetailMap = ({ places }: RouteDetailMapProps) => {
  const firstPoint = places.map(getPlaceCoords).find((coords) => coords !== null)

  if (!firstPoint || places.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border bg-slate-50 text-sm text-slate-500">
        No hay coordenadas disponibles para pintar el mapa.
      </div>
    )
  }

  return <MapNoSSR places={places} coords={firstPoint} zoom={15} routePlaces={places} />
}

