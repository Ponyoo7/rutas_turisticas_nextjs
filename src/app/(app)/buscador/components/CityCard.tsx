'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
      const cityFromEsWiki = await locationsService.getWikiInfoByTitle(city.title, 'es')
      const cityFromEnWiki =
        cityFromEsWiki ?? (await locationsService.getWikiInfoByTitle(city.title, 'en'))

      if (!cancelled && cityFromEnWiki) {
        setCityInfo(cityFromEnWiki)
      }
    }

    loadCityInfo()

    return () => {
      cancelled = true
    }
  }, [city.title])

  const description = cityInfo.extract
    ? cityInfo.extract.replace(/\s+/g, ' ').trim()
    : 'Sin descripcion disponible.'

  const shortDescription =
    description.length > 140 ? `${description.slice(0, 140)}...` : description

  return (
    <Link href={`/ciudad/${cityInfo.title}`}>
      <Card className='relative h-full pt-0'>
        <div className='relative h-44'>
          <Image
            src={cityInfo.thumbnail?.source ?? '/museo_placeholder.jpg'}
            fill
            alt={cityInfo.title}
            className='rounded-t-xl object-cover'
          />
        </div>

        <CardHeader>
          <CardTitle>{cityInfo.title}</CardTitle>
          <CardDescription>{shortDescription}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
