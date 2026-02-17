'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'

import { Button } from '@/shared/components/ui/button'

interface Props {
  city: WikiData
}

export const CityCard = ({ city }: Props) => {
  const [cityInfo, setCityInfo] = useState<WikiData>(city)
  const [isHovering, setIsHovering] = useState<boolean>(false)

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
    <div
      className="flex flex-col gap-3 group h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-full aspect-5/3 rounded-xl shadow-md overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isHovering ? 'blur-[2px] scale-110' : 'scale-100'}`}
          style={{
            backgroundImage: `url("${cityInfo.thumbnail?.source ?? '/museo_placeholder.jpg'}")`,
          }}
        />

        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            className="w-32 bg-white text-artis-primary hover:bg-gray-100 font-bold shadow-lg"
            asChild
          >
            <Link href={`/ciudad/${city.title}`}>Explora</Link>
          </Button>
          <Button
            className="w-32 bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none"
            asChild
          >
            <Link href={`/rutas/crear?city=${city.title}`}>Crear ruta</Link>
          </Button>
        </div>
      </div>
      <Link
        href={`/ciudad/${cityInfo.title}`}
        className="px-1 flex flex-col gap-1"
      >
        <p className="text-artis-primary dark:text-gray-100 text-xl font-bold font-serif group-hover:text-artis-primary/80 transition-colors">
          {cityInfo.title}
        </p>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
          {cityInfo.extract || 'Sin descripción disponible.'}
        </p>
      </Link>
    </div>
  )
}
