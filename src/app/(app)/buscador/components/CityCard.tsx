'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'

interface Props {
  city: WikiData
}

export const CityCard = ({ city }: Props) => {
  const [cityInfo, setCityInfo] = useState<WikiData>(city)

  useEffect(() => {
    let cancelled = false

    const loadCityInfo = async () => {
      const cityFromEsWiki = await locationsService.getWikiInfoByTitle(
        city.title,
        'es',
      )
      const cityFromEnWiki =
        cityFromEsWiki ??
        (await locationsService.getWikiInfoByTitle(city.title, 'en'))

      if (!cancelled && cityFromEnWiki) {
        setCityInfo(cityFromEnWiki)
      }
    }

    loadCityInfo()

    return () => {
      cancelled = true
    }
  }, [city.title])

  return (
    <Link
      href={`/ciudad/${cityInfo.title}`}
      className="flex flex-col gap-3 group h-full"
    >
      <div
        className="relative w-full aspect-5/3 bg-cover bg-center rounded-xl shadow-md overflow-hidden"
        style={{
          backgroundImage: `url("${cityInfo.thumbnail?.source ?? '/museo_placeholder.jpg'}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
      </div>
      <div className="px-1 flex flex-col gap-1">
        <p className="text-artis-primary dark:text-gray-100 text-xl font-bold font-serif group-hover:text-artis-primary/80 transition-colors">
          {cityInfo.title}
        </p>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
          {cityInfo.extract || 'Sin descripción disponible.'}
        </p>
      </div>
    </Link>
  )
}
