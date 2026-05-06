'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { useMyRoutes } from '@/shared/hooks/useMyRoutes'
import { useUserStore } from '@/shared/stores/useUserStore'
import Link from 'next/link'
import { RouteCard } from './RouteCard'

export const MyRoutes = () => {
  const { t } = useI18n()
  const { myRoutes } = useMyRoutes()
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return (
    <section className="mt-8 mb-24">
      <div className="flex flex-row items-center gap-4 pb-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          {t('home.myRoutes.title')}
        </h2>
        <div className="h-px w-full flex-1 bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {myRoutes.length === 0 && (
          <div className="py-8 text-center">
            <p className="mb-4 text-gray-500">{t('home.myRoutes.empty')}</p>
            <Button
              className="border-none bg-artis-primary font-bold text-white shadow-lg hover:bg-artis-primary/90"
              asChild
            >
              <Link href="/buscador">{t('home.myRoutes.cta')}</Link>
            </Button>
          </div>
        )}
        {myRoutes.map((route, index) => (
          <RouteCard key={index} route={route} />
        ))}
      </div>
    </section>
  )
}
