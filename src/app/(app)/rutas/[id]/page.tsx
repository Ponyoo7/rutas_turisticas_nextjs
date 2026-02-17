import { getMyRouteById } from '@/actions/routes.actions'
import { verifyToken } from '@/actions/user.actions'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { RouteStatsCards } from './components/RouteStatsCards'
import { RoutePlacesList } from './components/RoutePlacesList'
import { RouteDetailMap } from './components/RouteDetailMap'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  if (!user) redirect('/login')

  const route = await getMyRouteById(parsedId)

  if (!route) notFound()

  return (
    <main className="w-full h-full p-4">
      <div className="flex flex-col gap-6">
        <section className="mt-8">
          <div className="flex flex-row gap-4 items-center pb-6">
            <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
              Estadísticas
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
