'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Props {
  city: WikiData
}

export const CityCard = ({ city }: Props) => {
  const { t } = useI18n()
  const [cityInfo, setCityInfo] = useState<WikiData>(city)
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const cityName = cityInfo.title || city.title
  const image =
    locationsService.toRenderableImageUrl(cityInfo.thumbnail?.source) ??
    '/museo_placeholder.jpg'

  useEffect(() => {
    setCityInfo(city)
  }, [city])

  useEffect(() => {
    if (city.isMainCity) {
      return
    }

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

    void loadCityInfo()

    return () => {
      cancelled = true
    }
  }, [city.isMainCity, city.title])

  return (
    <div
      className="group flex h-full flex-col gap-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-5/3 w-full overflow-hidden rounded-xl shadow-md">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isHovering ? 'scale-110 blur-[2px]' : 'scale-100'}`}
          style={{
            backgroundImage: `url("${image}")`,
          }}
        />

        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            isHovering ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <Button
            className="w-32 bg-white font-bold text-artis-primary shadow-lg hover:bg-gray-100"
            asChild
          >
            <Link href={`/ciudad/${cityName}`}>{t('searchPage.explore')}</Link>
          </Button>
          <Button
            className="w-32 border-none bg-artis-primary font-bold text-white shadow-lg hover:bg-artis-primary/90"
            asChild
          >
            <Link href={`/rutas/crear?city=${cityName}`}>
              {t('searchPage.createRoute')}
            </Link>
          </Button>
        </div>
      </div>
      <Link href={`/ciudad/${cityName}`} className="flex flex-col gap-1 px-1">
        <p className="font-serif text-xl font-bold text-artis-primary transition-colors group-hover:text-artis-primary/80 dark:text-gray-100">
          {cityName}
        </p>
        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-gray-500">
          {cityInfo.extract || t('searchPage.noDescription')}
        </p>
      </Link>
    </div>
  )
}
