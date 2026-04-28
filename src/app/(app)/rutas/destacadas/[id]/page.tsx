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
  const previewImage = route.image || '/museo_placeholder.jpg'

  return (
    <main className="h-full w-full p-4">
      <div className="flex flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="relative min-h-[280px] bg-[#efe4d2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt={`Portada de la ruta ${route.name}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                  Ruta destacada
                </p>
                <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
                  {route.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6 md:p-8">
              <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                  Descripcion
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {route.description ||
                    'Esta ruta destacada aun no tiene descripcion editorial.'}
                </p>
              </div>

              <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                  Galeria de la experiencia
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {route.contributedImages.length === 0
                    ? 'Todavia no hay imagenes de usuarios aprobadas para esta ruta.'
                    : `Esta ruta incluye ${route.contributedImages.length} imagen${route.contributedImages.length === 1 ? '' : 'es'} aportadas por usuarios.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border border-artis-primary/30 bg-white font-bold text-artis-primary shadow-lg transition-colors hover:bg-gray-50"
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
          </div>
        </section>

        {route.contributedImages.length > 0 && (
          <section className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary">
                Imagenes aprobadas
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {route.contributedImages.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7]"
                >
                  <div className="relative h-52 bg-[#efe4d2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image}
                      alt={`Imagen aprobada de la ruta ${route.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-row items-center gap-4 pb-6">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
              Estadisticas
            </h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <RouteStatsCards places={route.places} />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
                Mapa
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="sticky top-8 overflow-hidden rounded-2xl">
              <RouteDetailMap places={route.places} />
            </div>
          </section>
          <section>
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
                Itinerario
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <RoutePlacesList places={route.places} />
          </section>
        </div>
      </div>
    </main>
  )
}
