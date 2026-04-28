'use client'

import { OSMElement } from '@/shared/types/locations'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { PlaceCard } from './PlaceCard'

interface Props {
  places: OSMElement[]
  isLoading?: boolean
  errorMessage?: string | null
}

const RelevantPlacesSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="h-80 animate-pulse rounded-[24px] bg-gray-100"
      />
    ))}
  </div>
)

export const RelevantPlaces = ({
  places,
  isLoading = false,
  errorMessage = null,
}: Props) => {
  const selectedPlaces = places
    .filter((place) => place.tags.name)
    .filter((place) => place.tags.tourism !== 'museum' || place.tags.website)
    .sort((left, right) =>
      (left.tags.name ?? '').localeCompare(right.tags.name ?? ''),
    )
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          Sitios interesantes
        </h2>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      {isLoading && selectedPlaces.length === 0 ? (
        <RelevantPlacesSkeleton />
      ) : selectedPlaces.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-artis-primary/20 bg-[#fcfaf7] p-8 text-center">
          <p className="font-serif text-2xl font-bold text-artis-primary">
            Todavia no hay lugares destacados para mostrar.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            {errorMessage
              ? errorMessage
              : 'En cuanto tengamos puntos turisticos para esta ciudad, apareceran aqui con sus detalles.'}
          </p>
        </div>
      ) : (
        <Carousel className="w-full" opts={{ align: 'start' }}>
          <CarouselContent>
            {selectedPlaces.map((place) => (
              <CarouselItem
                key={`${place.type}-${place.id}`}
                className="basis-[86%] sm:basis-[58%] lg:basis-[42%] xl:basis-[32%]"
              >
                <PlaceCard place={place} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  )
}
