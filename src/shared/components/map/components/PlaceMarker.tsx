'use client'

import { Marker, Popup, useMap } from 'react-leaflet'
import { Button } from '@/shared/components/ui/button'
import { OSMElement } from '@/shared/types/locations'
import { getIconForPlace } from '../mapIcons'

interface PlaceMarkerProps {
  place: OSMElement
  onHandleClick: (place: OSMElement) => void
}

export const PlaceMarker = ({ place, onHandleClick }: PlaceMarkerProps) => {
  const map = useMap()
  const lat = place.lat || place.center?.lat
  const lon = place.lon || place.center?.lon

  if (!lat || !lon) return null

  return (
    <Marker position={[lat, lon]} icon={getIconForPlace(place)}>
      <Popup>
        <h3 className="font-bold">{place.tags.name || 'Sitio Historico'}</h3>
        <p className="text-xs italic mb-2">
          {place.tags.historic === 'archaeological_site'
            ? 'Sitio Arqueologico'
            : (place.tags.tourism ?? 'Turismo')}
        </p>
        <Button
          size="sm"
          onClick={() => {
            onHandleClick(place)
            map.closePopup()
          }}
        >
          Anadir a la ruta
        </Button>
      </Popup>
    </Marker>
  )
}
