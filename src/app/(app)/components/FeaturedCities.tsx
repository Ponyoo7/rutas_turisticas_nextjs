import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { getDefaultCities } from '@/shared/consts/data'
import { getTranslations } from '@/shared/i18n/server'
import { FeaturedCityCard } from './FeaturedCityCard'

export const FeaturedCities = async () => {
  const { t } = await getTranslations()
  const cities = await getDefaultCities()

  return (
    <section className="mt-8">
      <div className="flex flex-row items-center justify-between gap-4 pb-4">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          {t('home.featuredCities.title')}
        </h2>
        <div className="h-px w-full flex-1 bg-gray-200"></div>
      </div>

      <div>
        <Carousel className="w-full">
          <CarouselContent>
            {cities.map((city) => (
              <CarouselItem
                key={city.title}
                className="basis-[280px] md:basis-[320px] xl:basis-[360px]"
              >
                <FeaturedCityCard city={city} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
