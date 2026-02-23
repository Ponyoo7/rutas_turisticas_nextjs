import { getDefaultCities } from '@/shared/consts/data'
import { FeaturedCityCard } from './FeaturedCityCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'

/**
 * Componente que renderiza una sección con un carrusel interactivo
 * mostrando sugerencias de ciudades populares para explorar.
 */
export const FeaturedCities = async () => {
  const cities = await getDefaultCities()

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between pb-4 flex-row gap-4">
        <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
          Ciudades populares
        </h2>
        <div className="h-px w-full bg-gray-200 flex-1"></div>
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
    </section>
  )
}
