import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { formatDuration, getRouteStats } from '@/lib/utils'
import { OSMElement } from '@/shared/types/locations'

interface RouteStatsCardsProps {
  places: OSMElement[]
}

export const RouteStatsCards = ({ places }: RouteStatsCardsProps) => {
  const stats = getRouteStats(places)

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Paradas</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.placesCount}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">
            Distancia estimada
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalDistanceKm} km</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600">Tiempo a pie</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {formatDuration(stats.totalMinutes)}
        </CardContent>
      </Card>
    </section>
  )
}

