'use client'

import { Button } from '@/shared/components/ui/button'
import { useMyRoutes } from '@/shared/hooks/useMyRoutes'
import { useRouter } from 'next/navigation'
import { RouteCardWithActions } from './RouteCardWithActions'

/**
 * Muestra las rutas creadas por el usuario autenticado en un panel visual
 * mas espacioso y orientado a gestion.
 */
export function MyRoutes() {
  const router = useRouter()
  const { myRoutes, isLoading, refetch } = useMyRoutes()

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#eadfce] bg-gradient-to-br from-white via-[#fffaf4] to-[#f6efe3] p-6 shadow-[0_24px_70px_-48px_rgba(92,58,14,0.55)] md:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[#f2e5d3] via-[#fff7ed] to-[#f4efe8] opacity-80" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex w-fit rounded-full border border-white/80 bg-white/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-artis-primary/65 shadow-sm backdrop-blur-sm">
              Cuaderno de viaje
            </span>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-artis-primary md:text-4xl">
                Mis rutas
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                Revisa tus recorridos, ajusta la descripcion y manten al dia
                las imagenes que has aportado en cada experiencia.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-[#e7d9c6] bg-white px-4 py-2 text-sm font-semibold text-artis-primary shadow-sm">
              {myRoutes.length} rutas
            </span>
            <Button
              className="rounded-full border-none bg-artis-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-artis-primary/90"
              onClick={() => router.push('/buscador')}
            >
              Crear nueva ruta
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[470px] animate-pulse rounded-[28px] bg-white/80"
              />
            ))}
          </div>
        )}

        {!isLoading && myRoutes.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#e6d7c4] bg-white/80 px-6 py-14 text-center shadow-sm">
            <span className="material-symbols-outlined mb-4 block text-5xl text-[#c9b18f]">
              map
            </span>
            <p className="font-serif text-2xl font-bold text-artis-primary">
              Tu mapa personal todavia esta vacio
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Cuando guardes una ruta, la tendras aqui con sus paradas, su
              descripcion y las fotos que quieras aportar.
            </p>
            <Button
              className="mt-6 rounded-full border-none bg-artis-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-artis-primary/90"
              onClick={() => router.push('/buscador')}
            >
              Crear mi primera ruta
            </Button>
          </div>
        )}

        {!isLoading && myRoutes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {myRoutes.map((route) => (
              <RouteCardWithActions
                key={route.id}
                route={route}
                onDelete={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
