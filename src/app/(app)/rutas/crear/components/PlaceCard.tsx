'use client'

import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement, WikiData } from '@/shared/types/locations'
import { useEffect, useState } from 'react'

interface Props {
  place: OSMElement
  index: number
  onDelete: (placeId: number) => void
}

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
      className="bg-slate-100 p-2 rounded shadow-sm text-sm border flex items-center gap-2"
    >
      <span className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs font-bold shrink-0">
        {index}
      </span>
      <span>
        <img src={placeInfo?.thumbnail?.source} />
      </span>
      <span className="truncate max-w-37.5">
        {place.tags.name || 'Sitio sin nombre'}
      </span>
      <Button onClick={() => onDelete(place.id)}>Borrar</Button>
    </div>
  )
}

