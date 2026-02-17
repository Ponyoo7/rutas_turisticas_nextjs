'use client'

import { Marker, Popup, useMap } from 'react-leaflet'
import { Button } from '@/shared/components/ui/button'
import { OSMElement } from '@/shared/types/locations'
import { getIconForPlace } from '../mapIcons'

interface PlaceMarkerProps {
  place: OSMElement
  onClick?: (place: OSMElement) => void
}

export const PlaceMarker = ({ place, onClick }: PlaceMarkerProps) => {
  const map = useMap()
  const lat = place.lat || place.center?.lat
  const lon = place.lon || place.center?.lon

  if (!lat || !lon) return null

  const handlePlaceClick = (place: OSMElement) => {
    if (onClick) onClick(place)
  }

  return (
    <Marker position={[lat, lon]} icon={getIconForPlace(place)}>
      <Popup>
        <h3 className="font-bold">{place.tags.name || 'Sitio Historico'}</h3>
        <p className="text-xs italic mb-2">
          {place.tags.historic === 'archaeological_site'
            ? 'Sitio Arqueologico'
            : (place.tags.tourism ?? 'Turismo')}
        </p>
        {onClick && (
          <Button
            className="bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none transition-colors"
            size="sm"
            onClick={() => {
              handlePlaceClick(place)
              map.closePopup()
            }}
          >
            Anadir a la ruta
          </Button>
        )}
      </Popup>
    </Marker>
  )
}
