'use client'

import { getPlaceTypeLabel } from '@/lib/utils'
import { useI18n } from '@/shared/i18n/I18nProvider'
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
  const { locale, t } = useI18n()
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
    <div className="group flex items-center gap-4 rounded-[28px] bg-[#fbfcfd] p-4 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-artis-primary text-sm font-bold text-white shadow-sm">
        {index}
      </div>

      <div className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[20px] bg-[#eef2f6]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            className="h-full w-full object-cover"
            alt={t('routeBuilder.placeCard.imageAlt', {
              name: place.tags.name ?? t('common.unnamedStop'),
            })}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eef2f6] via-[#fafbfd] to-[#dfe7ef] text-xs font-semibold text-artis-primary/60">
            {t('routeBuilder.placeCard.noPhoto')}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/45">
          {getPlaceTypeLabel(place, locale)}
        </p>
        <h4 className="mt-1 truncate font-semibold text-artis-primary">
          {place.tags.name || t('routeBuilder.placeCard.unnamedStop')}
        </h4>
        <p className="mt-1 truncate text-sm text-gray-500">
          {place.tags.addr_street ||
            place.tags.city ||
            place.tags.town ||
            place.tags.village ||
            t('routeBuilder.placeCard.addedToRoute')}
        </p>
      </div>

      <div className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-artis-primary/35 md:flex">
        <IconChevronRight size={14} />
        {t('routeBuilder.placeCard.route')}
      </div>

      <button
        onClick={() => onDelete(place.id)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-white text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        title={t('routeBuilder.placeCard.deletePlace')}
      >
        <IconTrash size={18} />
      </button>
    </div>
  )
}
