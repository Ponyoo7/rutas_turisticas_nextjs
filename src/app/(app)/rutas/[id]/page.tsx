import { getMyRouteById } from '@/actions/routes.actions'
import { verifyToken } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
import { IconEdit } from '@tabler/icons-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { DeleteRouteButton } from './components/DeleteRouteButton'
import { RouteDetailMap } from './components/RouteDetailMap'
import { RoutePlacesList } from './components/RoutePlacesList'
import { RouteStatsCards } from './components/RouteStatsCards'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Página principal de los detalles de una ruta completada (`[id]`).
 * Actúa protegida: redirige a /login si no hay token válido guardado en la sesión.
 * Carga todos los lugares asociados a la ruta del usuario, desglosándolo en tres ejes:
 * 1) Estadísticas, 2) Mapa Interactivo Integral y 3) Lista del Itinerario.
 */
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
              Estadisticas
            </h2>
            <div className="h-px w-full bg-gray-200 flex-1"></div>
            <Button
              variant="outline"
              className="rounded-xl bg-white text-artis-primary hover:bg-gray-50 font-bold shadow-lg border border-artis-primary/30 transition-colors gap-2"
              asChild
            >
              <Link href={`/rutas/crear?routeId=${parsedId}`}>
                <IconEdit size={18} />
                Editar ruta
              </Link>
            </Button>
            <DeleteRouteButton routeId={parsedId} />
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
