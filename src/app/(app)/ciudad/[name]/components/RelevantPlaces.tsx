import { OSMElement } from '@/shared/types/locations'
import { PlaceCard } from './PlaceCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'

interface Props {
  places: OSMElement[]
}

export const RelevantPlaces = ({ places }: Props) => {
  const selectedPlaces = places
    .filter((e) => e.tags.tourism !== 'museum' && e.tags.website)
    .sort((left, right) =>
      (left.tags.name ?? '').localeCompare(right.tags.name ?? ''),
    )
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
          Sitios interesantes
        </h2>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>
      <Carousel className="w-full" opts={{ align: 'start' }}>
        <CarouselContent>
          {selectedPlaces.map((place) => (
            <CarouselItem
              key={place.id}
              className="basis-[86%] sm:basis-[58%] lg:basis-[42%] xl:basis-[32%]"
            >
              <PlaceCard place={place} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
