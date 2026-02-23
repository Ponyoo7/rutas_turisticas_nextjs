'use client'

import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement, WikiData } from '@/shared/types/locations'
import { useEffect, useState } from 'react'

import { IconTrash } from '@tabler/icons-react'

interface Props {
  place: OSMElement
  index: number
  onDelete: (placeId: number) => void
}

/**
 * Componente que representa un lugar añadido recientemente a la ruta en curso.
 * Intenta cargar, después de montarse, su imagen representativa desde Wikipedia para previsualización.
 * Contiene el control numérico de índice y un botón para descartarlo (eliminarlo).
 */
export const PlaceCard = ({ place, index, onDelete }: Props) => {
  const [placeInfo, setPlaceInfo] = useState<WikiData | null>(null)

  useEffect(() => {
    if (!place) return

    locationsService.getWikiInfo(place.tags.wikipedia).then((res) => {
      setPlaceInfo(res)
    })
  }, [])

  return (
    <div
      key={place.id}
      className="bg-white p-2 pr-3 rounded-lg shadow-sm text-sm border border-gray-200 flex items-center gap-3 group hover:border-artis-primary/50 transition-all"
    >
      <div className="flex items-center justify-center w-6 h-6 bg-artis-primary text-white rounded-full text-xs font-bold shrink-0 shadow-sm">
        {index}
      </div>
      {placeInfo?.thumbnail?.source && (
        <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
          <img
            src={placeInfo.thumbnail.source}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      )}
      <span className="truncate max-w-40 font-medium text-gray-700">
        {place.tags.name || 'Sitio sin nombre'}
      </span>
      <button
        onClick={() => onDelete(place.id)}
        className="ml-auto text-gray-300 hover:text-red-500 transition-colors p-1"
        title="Eliminar sitio"
      >
        <IconTrash size={18} />
      </button>
    </div>
  )
}
