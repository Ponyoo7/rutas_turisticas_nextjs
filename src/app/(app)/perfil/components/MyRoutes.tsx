'use client'

import { Button } from '@/shared/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/components/ui/carousel'
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
  const shouldUseCarousel = myRoutes.length > 3

  return (
    <section className="rounded-[32px] bg-white p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-artis-primary md:text-4xl">
                Mis rutas
              </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-[#faf8f4] px-4 py-2 text-sm font-semibold text-artis-primary">
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
                className="h-[470px] animate-pulse rounded-[28px] bg-[#faf8f4]"
              />
            ))}
          </div>
        )}

        {!isLoading && myRoutes.length === 0 && (
          <div className="rounded-[28px] bg-white px-6 py-14 text-center">
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

        {!isLoading && myRoutes.length > 0 && !shouldUseCarousel && (
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

        {!isLoading && shouldUseCarousel && (
          <Carousel className="w-full px-12" opts={{ align: 'start' }}>
            <CarouselContent>
              {myRoutes.map((route) => (
                <CarouselItem
                  key={route.id}
                  className="basis-[92%] sm:basis-[68%] lg:basis-[50%] xl:basis-[34%]"
                >
                  <RouteCardWithActions route={route} onDelete={refetch} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-0 top-1/2 h-10 w-10 -translate-y-1/2 border-0 bg-[#faf8f4] text-artis-primary shadow-[0_18px_36px_-24px_rgba(92,58,14,0.35)] hover:bg-[#f3ede4] disabled:bg-[#f5f2ec] disabled:text-artis-primary/30" />
            <CarouselNext className="right-0 top-1/2 h-10 w-10 -translate-y-1/2 border-0 bg-[#faf8f4] text-artis-primary shadow-[0_18px_36px_-24px_rgba(92,58,14,0.35)] hover:bg-[#f3ede4] disabled:bg-[#f5f2ec] disabled:text-artis-primary/30" />
          </Carousel>
        )}
      </div>
    </section>
  )
}
