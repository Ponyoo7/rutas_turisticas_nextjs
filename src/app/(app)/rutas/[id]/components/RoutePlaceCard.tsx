'use client'

import { OSMElement, WikiData } from '@/shared/types/locations'
import { getPlaceTypeLabel } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { locationsService } from '@/shared/services/locations.service'

interface RoutePlaceCardProps {
  place: OSMElement
  index: number
}

/**
 * Tarjeta vertical compacta para presentar una parada individual del itinerario de la ruta.
 * Solicita dinámicamente las imágenes correspondientes a la API de Wikipedia
 * apoyándose en la etiqueta de identificación guardada en Base de Datos.
 */
export const RoutePlaceCard = ({ place, index }: RoutePlaceCardProps) => {
  const [placeInfo, setPlaceInfo] = useState<WikiData | null>(null)

  useEffect(() => {
    if (!place.tags.wikipedia) return

    locationsService.getWikiInfo(place.tags.wikipedia).then((res) => {
      setPlaceInfo(res)
    })
  }, [place.tags.wikipedia])

  const image =
    placeInfo?.thumbnail?.source ||
    place.tags.image ||
    place.tags.wikipedia_image ||
    '/museo_placeholder.jpg'

  return (
    <div className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div
        className="w-1/3 min-w-[120px] max-w-[200px] bg-cover bg-center shrink-0 transition-all duration-500"
        style={{ backgroundImage: `url("${image}")` }}
      ></div>
      <div className="p-4 flex flex-col justify-center gap-1 flex-1">
        <div className="text-[10px] font-bold text-artis-secondary-blue uppercase tracking-widest">
          PARADA {index + 1}
        </div>
        <h3 className="text-artis-primary dark:text-gray-100 text-lg font-bold leading-tight font-serif">
          {place.tags.name ?? 'Punto sin nombre'}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2">
          {getPlaceTypeLabel(place)}
        </p>
      </div>
    </div>
  )
}
