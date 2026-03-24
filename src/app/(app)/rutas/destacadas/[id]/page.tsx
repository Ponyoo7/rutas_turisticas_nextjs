import {
  getFeaturedRouteById,
  getMyFavoriteRouteIds,
} from '@/actions/routes.actions'
import { FavoriteRouteButton } from '@/app/(app)/components/FavoriteRouteButton'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RouteDetailMap } from '../../[id]/components/RouteDetailMap'
import { RoutePlacesList } from '../../[id]/components/RoutePlacesList'
import { RouteStatsCards } from '../../[id]/components/RouteStatsCards'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FeaturedRouteDetailPage({ params }: PageProps) {
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const [route, favoriteRouteIds] = await Promise.all([
    getFeaturedRouteById(parsedId),
    getMyFavoriteRouteIds(),
  ])

  if (!route) notFound()

  const isFavorite = favoriteRouteIds.includes(route.id)

  return (
    <main className="w-full h-full p-4">
      <div className="flex flex-col gap-6">
        <section className="mt-8">
          <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
                Ruta destacada
              </p>
              <h1 className="font-serif text-3xl font-bold text-artis-primary dark:text-gray-100">
                {route.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl bg-white text-artis-primary hover:bg-gray-50 font-bold shadow-lg border border-artis-primary/30 transition-colors"
                asChild
              >
                <Link href="/perfil">Ir a mi perfil</Link>
              </Button>
              <FavoriteRouteButton
                routeId={route.id}
                initialIsFavorite={isFavorite}
                mode="full"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-row gap-4 items-center pb-6">
            <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
              Estadisticas
            </h2>
            <div className="h-px w-full bg-gray-200 flex-1"></div>
          </div>
          <RouteStatsCards places={route.places} />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex flex-row gap-4 items-center pb-6">
              <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
                Mapa
              </h2>
              <div className="h-px w-full bg-gray-200 flex-1"></div>
            </div>
            <div className="rounded-2xl overflow-hidden sticky top-8 ">
              <RouteDetailMap places={route.places} />
            </div>
          </section>
          <section>
            <div className="flex flex-row gap-4 items-center pb-6">
              <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
                Itinerario
              </h2>
              <div className="h-px w-full bg-gray-200 flex-1"></div>
            </div>
            <RoutePlacesList places={route.places} />
          </section>
        </div>
      </div>
    </main>
  )
}
