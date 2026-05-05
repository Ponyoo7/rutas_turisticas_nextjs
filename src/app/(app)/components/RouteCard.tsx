import { getRouteStats } from '@/lib/utils'
import { Route } from '@/shared/types/routes'
import Link from 'next/link'

interface Props {
  route: Route
}

/**
 * Componente visual de tarjeta que resume la información clave de una ruta.
 * Analiza la lista de lugares (`getRouteStats`) para extraer y mostrar
 * la distancia total, la duración estimada de recorrido y el conteo de paradas.
 */
export const RouteCard = ({ route }: Props) => {
  const stats = getRouteStats(route.places)
  const image = route.image || '/museo_placeholder.jpg'

  return (
    <Link
      href={`/rutas/${route.id}`}
      className="grid h-full min-h-[160px] grid-cols-[128px_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-[0_16px_36px_-30px_rgba(15,23,42,0.32)] transition-shadow hover:shadow-[0_24px_44px_-30px_rgba(15,23,42,0.4)] dark:border-gray-700 dark:bg-gray-800 md:grid-cols-[148px_minmax(0,1fr)]"
    >
      <div className="relative h-full min-h-[160px] overflow-hidden bg-[#eef2f6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`Imagen de la ruta ${route.name}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-artis-secondary-blue">
          <span className="material-symbols-outlined text-xs">Duracion</span>
          {stats.totalMinutes} MINUTOS
        </div>
        <h3 className="font-serif text-base font-bold leading-tight text-artis-primary dark:text-gray-100">
          {route.name}
        </h3>
        {route.description ? (
          <p className="line-clamp-1 text-xs text-gray-500">
            {route.description}
          </p>
        ) : null}
        <p className="line-clamp-1 text-xs text-gray-500">
          {stats.placesCount} PARADAS
        </p>
        <p className="line-clamp-1 text-xs text-gray-500">
          {stats.totalDistanceKm} KM
        </p>
      </div>
    </Link>
  )
}
