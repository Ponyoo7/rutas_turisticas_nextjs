import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { formatDuration, getRouteStats } from '@/lib/utils'
import { OSMElement } from '@/shared/types/locations'

interface RouteStatsCardsProps {
  places: OSMElement[]
}

/**
 * Componente que expone una pequeña cuadrícula con tarjetas informativas,
 * mostrando métricas esenciales calculadas (`getRouteStats`) sobre el itinerario:
 * cantidad de paradas, distancia estimada sumada y tiempo a pie requerido.
 */
export const RouteStatsCards = ({ places }: RouteStatsCardsProps) => {
  const stats = getRouteStats(places)

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Paradas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {stats.placesCount}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Distancia estimada
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {stats.totalDistanceKm} km
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tiempo a pie
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {formatDuration(stats.totalMinutes)}
        </CardContent>
      </Card>
    </section>
  )
}
