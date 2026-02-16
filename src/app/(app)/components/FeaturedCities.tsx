import { getDefaultCities } from '@/shared/consts/data'
import { FeaturedCityCard } from './FeaturedCityCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'

export const FeaturedCities = async () => {
  const cities = await getDefaultCities()

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between px-6 pb-2">
        <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
          Featured Cities
        </h2>
      </div>

      <div>
        <Carousel className="w-full">
          <CarouselContent>
            {cities.map((city) => (
              <CarouselItem key={city.title} className="basis-1/4.5">
                <FeaturedCityCard city={city} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* <div className="flex overflow-x-auto hide-scrollbar px-6 gap-5 py-4">
        {cities.map((city) => (
          <FeaturedCityCard key={city.title} city={city} />
        ))}
      </div> */}
    </section>
  )
}
