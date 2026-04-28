'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, Polyline, TileLayer } from 'react-leaflet'
import { OSMElement } from '@/shared/types/locations'
import { getPlaceCoords } from '@/lib/utils'
import { FlyToLocation } from './components/FlyToLocation'
import { PlaceMarker } from './components/PlaceMarker'
import { MapLegend } from './components/MapLegend'

interface MapProps {
  places: OSMElement[]
  coords: number[]
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

  return (
    <div className="relative w-full h-[600px]">
      <MapLegend />
      {places.length > 0 && (
        <MapContainer
          center={coords as [number, number]}
          zoom={zoom}
          className="w-full h-full rounded-xl shadow-inner"
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
            <PlaceMarker key={place.id} place={place} onClick={onClick} />
          ))}
        </MapContainer>
      )}
    </div>
  )
}
