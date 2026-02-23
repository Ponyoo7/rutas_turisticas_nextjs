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

  return (
    <Link
      href={`/rutas/${route.id}`}
      className="flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div
        className="w-1/3 aspect-square bg-cover bg-center"
        style={{ backgroundImage: `url("${route.image}")` }}
      ></div>
      <div className="w-2/3 p-4 flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-artis-secondary-blue uppercase tracking-widest">
          <span className="material-symbols-outlined text-xs">Duración</span>{' '}
          {stats.totalMinutes} MINUTOS
        </div>
        <h3 className="text-artis-primary dark:text-gray-100 text-lg font-bold leading-tight font-serif">
          {route.name}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-1">
          {stats.placesCount} PARADAS
        </p>
        <p className="text-gray-500 text-xs line-clamp-1">
          {stats.totalDistanceKm} KM
        </p>
      </div>
    </Link>
  )
}
