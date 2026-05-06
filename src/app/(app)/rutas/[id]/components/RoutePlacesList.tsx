import { getTranslations } from '@/shared/i18n/server'
import { OSMElement } from '@/shared/types/locations'
import { RoutePlaceCard } from './RoutePlaceCard'

interface RoutePlacesListProps {
  places: OSMElement[]
}

export const RoutePlacesList = async ({ places }: RoutePlacesListProps) => {
  const { t } = await getTranslations()

  return (
    <section className="space-y-3">
      {places.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('routeDetail.noPlaces')}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {places.map((place, index) => (
          <RoutePlaceCard
            key={`${place.type}-${place.id}-${index}`}
            place={place}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
