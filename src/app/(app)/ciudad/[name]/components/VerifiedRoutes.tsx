import {
  getFeaturedRoutesByCityPlaces,
  getMyFavoriteRouteIds,
} from '@/actions/routes.actions'
import { FeaturedRouteCard } from '@/app/(app)/components/FeaturedRouteCard'
import { Button } from '@/shared/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/shared/components/ui/carousel'
import { OSMElement } from '@/shared/types/locations'
import Link from 'next/link'

interface Props {
  name: string
  places: OSMElement[]
}

export const VerifiedRoutes = async ({ name, places }: Props) => {
  const [routes, favoriteRouteIds] = await Promise.all([
    getFeaturedRoutesByCityPlaces(places),
    getMyFavoriteRouteIds(),
  ])
  const cityPlaceIds = new Set(places.map((place) => place.id))
  const favoriteRouteIdSet = new Set(favoriteRouteIds)

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
          Rutas verificadas
        </h2>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-artis-primary/20 bg-[#fcfaf7] p-8 text-center">
          <p className="font-serif text-2xl font-bold text-artis-primary">
            Todavia no hay rutas verificadas en {name}.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-600">
            Cuando publiquemos una ruta destacada para esta ciudad, aparecera
            aqui junto a sus paradas y su duracion estimada.
          </p>
          <Button
            className="mt-6 bg-artis-primary text-white hover:bg-artis-primary/90"
            asChild
          >
            <Link href={`/rutas/crear?city=${name}`}>Crear ruta en {name}</Link>
          </Button>
        </div>
      ) : (
        <Carousel className="w-full" opts={{ align: 'start' }}>
          <CarouselContent>
            {routes.map((route) => {
              const matchingPlacesCount = route.places.filter((place) =>
                cityPlaceIds.has(place.id),
              ).length

              return (
                <CarouselItem
                  key={route.id}
                  className="basis-[88%] sm:basis-[62%] lg:basis-[46%] xl:basis-[34%]"
                >
                  <FeaturedRouteCard
                    route={route}
                    initialIsFavorite={favoriteRouteIdSet.has(route.id)}
                    primaryBadge="Verificada"
                    secondaryBadge={`${matchingPlacesCount} coincidencias`}
                    href={`/rutas/destacadas/${route.id}`}
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
