'use client'

import Link from 'next/link'
import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'

interface Props {
  city: WikiData
}

/**
 * Tarjeta individual para presentar una ciudad en el carrusel de ciudades destacadas.
 * Incluye atajos interactivos flotantes (explorar ciudad o crear ruta).
 */
export const FeaturedCityCard = ({ city }: Props) => {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const image =
    locationsService.toRenderableImageUrl(city.thumbnail?.source, {
      preferredWidth: 960,
    }) ??
    '/museo_placeholder.jpg'

  return (
    <div className="group flex w-full shrink-0 flex-col gap-4">
      <div
        className="relative aspect-[4/4.8] w-full overflow-hidden rounded-[24px] shadow-[0_24px_55px_-34px_rgba(15,23,42,0.42)]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isHovering ? 'blur-[2px] scale-110' : 'scale-100'}`}
          style={{
            backgroundImage: `url("${image}")`,
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
