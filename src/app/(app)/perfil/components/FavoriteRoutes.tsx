'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { useMyFavoriteRoutes } from '@/shared/hooks/useMyFavoriteRoutes'
import { FeaturedRouteCard } from '@/app/(app)/components/FeaturedRouteCard'

export function FavoriteRoutes() {
  const { t } = useI18n()
  const { favoriteRoutes, isLoading, refetch } = useMyFavoriteRoutes()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-artis-primary dark:text-white">
          {t('profile.favoriteRoutes.title')}
        </h2>
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-sm font-medium text-gray-500">
          {t('profile.favoriteRoutes.count', { count: favoriteRoutes.length })}
        </span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[360px] animate-pulse rounded-[24px] bg-gray-100"
            />
          ))}
        </div>
      )}

      {!isLoading && favoriteRoutes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <span className="material-symbols-outlined mb-4 block text-4xl text-gray-300">
            favorite
          </span>
          <p className="font-medium text-gray-500">
            {t('profile.favoriteRoutes.empty')}
          </p>
        </div>
      )}

      {!isLoading && favoriteRoutes.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoriteRoutes.map((route) => (
            <FeaturedRouteCard
              key={route.id}
              route={route}
              initialIsFavorite
              primaryBadge={route.featured ? t('common.featured') : t('common.saved')}
              href={`/rutas/destacadas/${route.id}`}
              onFavoriteChange={(isFavorite) => {
                if (!isFavorite) refetch()
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
