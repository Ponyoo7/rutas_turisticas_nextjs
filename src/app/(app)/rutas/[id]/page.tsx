import { getMyRouteById } from '@/actions/routes.actions'
import { verifyToken } from '@/actions/user.actions'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { RouteDetailHeader } from './components/RouteDetailHeader'
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
    <main className="min-h-screen bg-artis-background-light dark:bg-artis-background-dark py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-10">
          <RouteDetailHeader route={route} />
          <div className="mt-8">
            <RouteStatsCards places={route.places} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
              <h2 className="text-2xl font-bold font-serif text-artis-primary dark:text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">map</span>
                Itinerario
              </h2>
              <RoutePlacesList places={route.places} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-8">
              <div className="h-[500px] w-full relative">
                <RouteDetailMap places={route.places} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
