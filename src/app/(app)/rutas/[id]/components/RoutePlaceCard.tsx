'use client'

import { getPlaceTypeLabel } from '@/lib/utils'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement, WikiData } from '@/shared/types/locations'
import { useEffect, useState } from 'react'

interface RoutePlaceCardProps {
  place: OSMElement
  index: number
}

export const RoutePlaceCard = ({ place, index }: RoutePlaceCardProps) => {
  const { locale, t } = useI18n()
  const [placeInfo, setPlaceInfo] = useState<WikiData | null>(
    place.wikiInfo ?? null,
  )

  useEffect(() => {
    if (placeInfo || !place.tags.wikipedia) return

    locationsService.getWikiInfo(place.tags.wikipedia).then((res) => {
      setPlaceInfo(res)
    })
  }, [place.tags.wikipedia, placeInfo])

  const image =
    locationsService.getPlaceImage(place, placeInfo) || '/museo_placeholder.jpg'

  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div
        className="w-1/3 min-w-[120px] max-w-[200px] shrink-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url("${image}")` }}
      ></div>
      <div className="flex flex-1 flex-col justify-center gap-1 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-artis-secondary-blue">
          {t('routeDetail.stopLabel', { index: index + 1 })}
        </div>
        <h3 className="font-serif text-lg font-bold leading-tight text-artis-primary dark:text-gray-100">
          {place.tags.name ?? t('common.unnamedPoint')}
        </h3>
        <p className="line-clamp-2 text-xs text-gray-500">
          {getPlaceTypeLabel(place, locale)}
        </p>
      </div>
    </div>
  )
}
