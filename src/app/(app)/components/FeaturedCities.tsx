import { getDefaultCities } from '@/shared/consts/data'
import { FeaturedCityCard } from './FeaturedCityCard'
import { Carousel, CarouselContent, CarouselItem } from '@/shared/components/ui/carousel'

export const FeaturedCities = async () => {
  const cities = await getDefaultCities()

  return (
    <div>
      <h2>Ciudades populares</h2>

      <Carousel className='w-full'>
        <CarouselContent>
          {cities.map((city) => (
            <CarouselItem key={city.title} className='basis-1/4.5'>
              <FeaturedCityCard city={city} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

