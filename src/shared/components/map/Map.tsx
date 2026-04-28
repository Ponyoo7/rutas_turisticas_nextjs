'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, Polyline, TileLayer } from 'react-leaflet'
import { getPlaceCoords } from '@/lib/utils'
import { OSMElement } from '@/shared/types/locations'
import { FlyToLocation } from './components/FlyToLocation'
import { MapLegend } from './components/MapLegend'
import { PlaceMarker } from './components/PlaceMarker'

interface MapProps {
  places: OSMElement[]
  coords: number[] | null
  zoom: number
  flyTo?: [number, number] | null
  onClick?: (place: OSMElement) => void
  routePlaces?: OSMElement[]
}

export default function Map({
  places,
  coords,
  zoom,
  flyTo = null,
  onClick,
  routePlaces = [],
}: MapProps) {
  const routePositions = routePlaces
    .map(getPlaceCoords)
    .filter((position): position is [number, number] => position !== null)
  const hasCoords = Array.isArray(coords) && coords.length === 2

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl">
      {hasCoords ? (
        <>
          <MapLegend />
          <MapContainer
            center={coords as [number, number]}
            zoom={zoom}
            className="h-full w-full rounded-xl shadow-inner"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyToLocation coords={flyTo} />

            {routePositions.length > 0 && (
              <Polyline
                positions={routePositions}
                color="#805826"
                weight={6}
                opacity={0.8}
              />
            )}

            {places.map((place) => (
              <PlaceMarker
                key={`${place.type}-${place.id}`}
                place={place}
                onClick={onClick}
              />
            ))}
          </MapContainer>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-artis-primary/20 bg-[#fcfaf7] p-8 text-center">
          <div className="max-w-md">
            <p className="font-serif text-2xl font-bold text-artis-primary">
              Estamos centrando el mapa
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              La ciudad ya se esta cargando. En cuanto tengamos las coordenadas,
              veras el mapa y luego anadiremos los puntos turisticos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
