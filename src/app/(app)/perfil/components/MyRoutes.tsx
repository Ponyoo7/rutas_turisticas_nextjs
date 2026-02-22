'use client'

import { useMyRoutes } from '@/shared/hooks/useMyRoutes'
import { Button } from '@/shared/components/ui/button'
import { useRouter } from 'next/navigation'
import { RouteCardWithActions } from './RouteCardWithActions'

export function MyRoutes() {
  const router = useRouter()
  const { myRoutes, isLoading, refetch } = useMyRoutes()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold font-serif text-artis-primary dark:text-white">
          Mis rutas
        </h2>
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-sm font-medium text-gray-500">
          {myRoutes.length} rutas
        </span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      )}

      {!isLoading && myRoutes.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-4 block">
            map
          </span>
          <p className="text-gray-500 font-medium">
            Aún no tienes rutas creadas.
          </p>
          <Button
            className="mt-4 bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none rounded-xl"
            onClick={() => router.push('/buscador')}
          >
            Crear mi primera ruta
          </Button>
        </div>
      )}

      {!isLoading && myRoutes.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myRoutes.map((route) => (
            <RouteCardWithActions
              key={route.id}
              route={route}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </section>
  )
}
