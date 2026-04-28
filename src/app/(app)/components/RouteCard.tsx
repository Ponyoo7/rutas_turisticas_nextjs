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
      className="flex cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="relative aspect-square w-1/3 bg-cover bg-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        ></div>
      </div>
      <div className="flex w-2/3 flex-col justify-center gap-2 p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-artis-secondary-blue">
          <span className="material-symbols-outlined text-xs">Duracion</span>
          {stats.totalMinutes} MINUTOS
        </div>
        <h3 className="font-serif text-lg font-bold leading-tight text-artis-primary dark:text-gray-100">
          {route.name}
        </h3>
        {route.description ? (
          <p className="line-clamp-2 text-xs text-gray-500">
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
