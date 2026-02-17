'use client'

import Link from 'next/link'
import { WikiData } from '@/shared/types/locations'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'

interface Props {
  city: WikiData
}

export const FeaturedCityCard = ({ city }: Props) => {
  const [isHovering, setIsHovering] = useState<boolean>(false)

  return (
    <div className="flex flex-col gap-3 shrink-0 w-64 group">
      <div
        className="relative w-full aspect-4/5 rounded-xl shadow-md overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isHovering ? 'blur-[2px] scale-110' : 'scale-100'}`}
          style={{
            backgroundImage: `url("${city.thumbnail?.source ?? '/museo_placeholder.jpg'}")`,
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
      <div className="px-1">
        <p className="text-artis-primary dark:text-gray-100 text-lg font-bold font-serif">
          {city.title}
        </p>
        <p className="text-gray-500 text-sm font-medium line-clamp-1">
          {city.extract}
        </p>
      </div>
    </div>
  )
}
