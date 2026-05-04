'use client'

import { getPlaceTypeLabel } from '@/lib/utils'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement, WikiData } from '@/shared/types/locations'
import { IconChevronRight, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface Props {
  place: OSMElement
  index: number
  onDelete: (placeId: number) => void
}

export const PlaceCard = ({ place, index, onDelete }: Props) => {
  const [placeInfo, setPlaceInfo] = useState<WikiData | null>(
    place.wikiInfo ?? null,
  )
  const image = locationsService.getPlaceImage(place, placeInfo)

  useEffect(() => {
    if (placeInfo || !place.tags.wikipedia) return

    locationsService.getWikiInfo(place.tags.wikipedia).then((res) => {
      setPlaceInfo(res)
    })
  }, [place.tags.wikipedia, placeInfo])

  return (
    <div className="group flex items-center gap-4 rounded-[24px] border border-[#eadfce] bg-[#fffdf9] p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-artis-primary/25 hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-artis-primary text-sm font-bold text-white shadow-sm">
        {index}
      </div>

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#efe4d2]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            className="h-full w-full object-cover"
            alt={`Vista previa de ${place.tags.name ?? 'la parada'}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eadbc6] via-[#f8f2ea] to-[#d9ccb7] text-xs font-semibold text-artis-primary/60">
            Sin foto
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/45">
          {getPlaceTypeLabel(place)}
        </p>
        <h4 className="mt-1 truncate font-semibold text-artis-primary">
          {place.tags.name || 'Sitio sin nombre'}
        </h4>
        <p className="mt-1 truncate text-sm text-gray-500">
          {place.tags.addr_street ||
            place.tags.city ||
            place.tags.town ||
            place.tags.village ||
            'Parada anadida al recorrido'}
        </p>
      </div>

      <div className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-artis-primary/35 md:flex">
        <IconChevronRight size={14} />
        Ruta
      </div>

      <button
        onClick={() => onDelete(place.id)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-white text-gray-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        title="Eliminar sitio"
      >
        <IconTrash size={18} />
      </button>
    </div>
  )
}
