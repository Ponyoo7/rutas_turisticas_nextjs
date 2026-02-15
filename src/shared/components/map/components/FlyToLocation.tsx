'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface FlyToLocationProps {
  coords: [number, number] | null
}

export const FlyToLocation = ({ coords }: FlyToLocationProps) => {
  const map = useMap()

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 17, { duration: 1.5 })
    }
  }, [coords, map])

  return null
}
