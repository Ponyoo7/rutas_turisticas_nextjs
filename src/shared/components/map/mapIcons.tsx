'use client'

import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { ComponentType } from 'react'
import {
  IconBuildingBank,
  IconBuildingBridge,
  IconBuildingMonument,
  IconMapPin,
  IconTeapot,
} from '@tabler/icons-react'
import { OSMElement } from '@/shared/types/locations'

export const legendItems = [
  { label: 'Museo', color: 'bg-blue-400', icon: IconBuildingBank },
  { label: 'Atracción', color: 'bg-rose-400', icon: IconBuildingBridge },
  { label: 'Monumento', color: 'bg-purple-400', icon: IconBuildingMonument },
  { label: 'Arqueológico', color: 'bg-green-500', icon: IconTeapot },
  { label: 'Otros', color: 'bg-amber-400', icon: IconMapPin },
]

const createCustomIcon = (
  IconComponent: ComponentType<{
    size?: number
    color?: string
    stroke?: number
  }>,
  bgClass: string,
) => {
  const iconHtml = renderToStaticMarkup(
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${bgClass} transform transition-transform hover:scale-110`}
    >
      <IconComponent size={20} color="white" stroke={2} />
      <div
        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${bgClass.replace('bg-', 'border-t-')}`}
      />
    </div>,
  )

  return L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const icons = {
  museum: createCustomIcon(legendItems[0].icon, legendItems[0].color),
  attraction: createCustomIcon(legendItems[1].icon, legendItems[1].color),
  monument: createCustomIcon(legendItems[2].icon, legendItems[2].color),
  archaeological: createCustomIcon(legendItems[3].icon, legendItems[3].color),
  default: createCustomIcon(legendItems[4].icon, legendItems[4].color),
}

export const getIconForPlace = (place: OSMElement) => {
  if (place.tags.tourism === 'museum') return icons.museum
  if (place.tags.tourism === 'attraction') return icons.attraction
  if (
    place.tags.historic === 'monument' ||
    place.tags.historic === 'memorial'
  ) {
    return icons.monument
  }
  if (place.tags.historic === 'archaeological_site') return icons.archaeological
  return icons.default
}
