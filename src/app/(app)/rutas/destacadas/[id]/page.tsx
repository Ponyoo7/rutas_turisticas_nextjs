import {
  getFeaturedRouteById,
  getMyFavoriteRouteIds,
} from '@/actions/routes.actions'
import { FavoriteRouteButton } from '@/app/(app)/components/FavoriteRouteButton'
import { isRouteInlineImageDataUrl } from '@/lib/route-images'
import { getTranslations } from '@/shared/i18n/server'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RouteDetailMap } from '../../[id]/components/RouteDetailMap'
import { RoutePlacesList } from '../../[id]/components/RoutePlacesList'
import { RouteStatsCards } from '../../[id]/components/RouteStatsCards'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FeaturedRouteDetailPage({ params }: PageProps) {
  const { locale, t } = await getTranslations()
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const [route, favoriteRouteIds] = await Promise.all([
    getFeaturedRouteById(parsedId),
    getMyFavoriteRouteIds(),
  ])

  if (!route) notFound()

  const isFavorite = favoriteRouteIds.includes(route.id)
  const previewImage = route.image || '/museo_placeholder.jpg'
  const isInlinePreviewImage = isRouteInlineImageDataUrl(previewImage)
  const contributedImagesSuffix =
    route.contributedImages.length === 1 ? '' : locale === 'es' ? 'es' : 's'
  const contributedImagesPluralSuffix =
    route.contributedImages.length === 1 ? '' : locale === 'es' ? 's' : ''

  return (
    <main className="h-full w-full p-4">
      <div className="flex flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="relative h-72 bg-[#efe4d2] sm:h-80 lg:h-[380px] xl:h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt={t('routeDetail.coverAlt', { name: route.name })}
                className={`h-full w-full ${
                  isInlinePreviewImage
                    ? 'object-contain bg-[#f8f3eb] p-2 sm:p-3'
                    : 'object-cover'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                  {t('routeDetail.featuredLabel')}
                </p>
                <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
                  {route.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6 md:p-8">
              <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                  {t('routeDetail.description')}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {route.description || t('routeDetail.featuredNoDescription')}
                </p>
              </div>

              <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                  {t('routeDetail.experienceGallery')}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {route.contributedImages.length === 0
                    ? t('routeDetail.noApprovedImagesYet')
                    : t('routeDetail.approvedImagesCount', {
                        count: route.contributedImages.length,
                        suffix: contributedImagesSuffix,
                        pluralSuffix: contributedImagesPluralSuffix,
                      })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border border-artis-primary/30 bg-white font-bold text-artis-primary shadow-lg transition-colors hover:bg-gray-50"
                  asChild
                >
                  <Link href="/perfil">{t('routeDetail.goToProfile')}</Link>
                </Button>
                <FavoriteRouteButton
                  routeId={route.id}
                  initialIsFavorite={isFavorite}
                  mode="full"
                />
              </div>
            </div>
          </div>
        </section>

        {route.contributedImages.length > 0 && (
          <section className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary">
                {t('routeDetail.approvedImagesTitle')}
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {route.contributedImages.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7]"
                >
                  <div className="relative h-40 bg-[#efe4d2] md:h-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image}
                      alt={t('routeDetail.approvedImageAlt', { name: route.name })}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-row items-center gap-4 pb-6">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
              {t('routeDetail.stats')}
            </h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <RouteStatsCards places={route.places} />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section>
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
                {t('routeDetail.map')}
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <div className="sticky top-8 overflow-hidden rounded-2xl">
              <RouteDetailMap places={route.places} />
            </div>
          </section>
          <section>
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
                {t('routeDetail.itinerary')}
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
            <RoutePlacesList places={route.places} />
          </section>
        </div>
      </div>
    </main>
  )
}
