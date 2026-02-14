import Image from 'next/image'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import Link from 'next/link'
import { WikiData } from '@/shared/types/locations'

interface Props {
  city: WikiData
}

export const FeaturedCityCard = ({ city }: Props) => {
  const description =
    city.extract.length > 110 ? `${city.extract.slice(0, 110)}...` : city.extract

  return (
    <Link href={`/ciudad/${city.title}`}>
      <Card className='relative w-64 pt-0'>
        <div className='relative h-52'>
          <Image
            src={city.thumbnail?.source ?? '/museo_placeholder.jpg'}
            fill
            alt={city.title}
            className='rounded-t-xl object-cover'
          />
        </div>
        <CardHeader className='z-3 bg-white'>
          <CardTitle>{city.title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
