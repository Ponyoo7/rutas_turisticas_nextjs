'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  city: WikiData
}

export const FeaturedCityCard = ({ city }: Props) => {
  const { t } = useI18n()
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const image =
    locationsService.toRenderableImageUrl(city.thumbnail?.source, {
      preferredWidth: 960,
    }) ?? '/museo_placeholder.jpg'

  return (
    <div className="group flex w-full shrink-0 flex-col gap-4">
      <div
        className="relative aspect-[4/4.8] w-full overflow-hidden rounded-[24px] shadow-[0_24px_55px_-34px_rgba(15,23,42,0.42)]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
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
            <Link href={`/ciudad/${city.title}`}>{t('home.featuredCities.explore')}</Link>
          </Button>
          <Button
            className="w-32 border-none bg-artis-primary font-bold text-white shadow-lg hover:bg-artis-primary/90"
            asChild
          >
            <Link href={`/rutas/crear?city=${city.title}`}>
              {t('home.featuredCities.createRoute')}
            </Link>
          </Button>
        </div>
      </div>
      <div className="px-1.5">
        <p className="font-serif text-xl font-bold text-artis-primary dark:text-gray-100">
          {city.title}
        </p>
        <p className="line-clamp-2 text-sm font-medium leading-6 text-gray-500">
          {city.extract}
        </p>
      </div>
    </div>
  )
}
