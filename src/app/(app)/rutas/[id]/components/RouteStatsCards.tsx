import { formatDuration, getRouteStats } from '@/lib/utils'
import { getTranslations } from '@/shared/i18n/server'
import { OSMElement } from '@/shared/types/locations'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

interface RouteStatsCardsProps {
  places: OSMElement[]
}

export const RouteStatsCards = async ({ places }: RouteStatsCardsProps) => {
  const { t } = await getTranslations()
  const stats = getRouteStats(places)

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('profile.myRoutes.stops')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {stats.placesCount}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('routeDetail.distanceEstimated')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {t('common.distanceKm', { count: stats.totalDistanceKm })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('routeDetail.walkingTime')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {formatDuration(stats.totalMinutes)}
        </CardContent>
      </Card>
    </section>
  )
}
