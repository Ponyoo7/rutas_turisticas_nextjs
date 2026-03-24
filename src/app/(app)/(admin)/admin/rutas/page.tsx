import { getAdminRoutes } from '@/actions/admin.actions'
import { AdminRoutesCatalog } from './components/AdminRoutesCatalog'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim() : ''
  const routes = await getAdminRoutes(query)

  return <AdminRoutesCatalog initialQuery={query} initialRoutes={routes} />
}
