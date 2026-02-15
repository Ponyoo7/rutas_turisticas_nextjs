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
    <main className="mx-auto w-full max-w-6xl space-y-6 p-6 md:p-8">
      <RouteDetailHeader route={route} />
      <RouteStatsCards places={route.places} />
      <RouteDetailMap places={route.places} />
      <RoutePlacesList places={route.places} />
    </main>
  )
}
