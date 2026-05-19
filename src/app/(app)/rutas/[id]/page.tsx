import {
  getRouteImageReviewDescription,
  getRouteImageReviewLabel,
  getRouteImageReviewTone,
  isRouteInlineImageDataUrl,
} from '@/lib/route-images'
import { getMyRouteById } from '@/actions/routes.actions'
import { verifyToken } from '@/actions/user.actions'
import { getTranslations } from '@/shared/i18n/server'
import { Button } from '@/shared/components/ui/button'
import { IconEdit, IconStar } from '@tabler/icons-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { DeleteRouteButton } from './components/DeleteRouteButton'
import { RouteDetailMap } from './components/RouteDetailMap'
import { RoutePlacesList } from './components/RoutePlacesList'
import { RouteStatsCards } from './components/RouteStatsCards'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const { locale, t } = await getTranslations()
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  if (!user) redirect('/login')

  const route = await getMyRouteById(parsedId)

  if (!route) notFound()

  const selectedCoverCandidate =
    route.contributedImages.find((image) => image.selectedForCover) ?? null
  const previewImage = route.image || '/museo_placeholder.jpg'
  const isInlinePreviewImage = isRouteInlineImageDataUrl(previewImage)
  const imagesCountSuffix =
    locale === 'es' ? (route.contributedImages.length === 1 ? '' : 'es') : route.contributedImages.length === 1 ? '' : 's'

  return (
    <main className="h-full w-full p-4">
      <div className="flex flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
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
                  {t('routeDetail.myRoute')}
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
                  {route.description || t('common.noDescription')}
                </p>
              </div>

              <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                  {t('routeDetail.contributedImages')}
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {route.contributedImages.length === 0
                    ? t('routeDetail.noImagesYet')
                    : t('routeDetail.imagesCount', {
                        count: route.contributedImages.length,
                        suffix: imagesCountSuffix,
                      })}
                </p>
                {selectedCoverCandidate && (
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {t('routeDetail.coverStatusPrefix')}{' '}
                    <span className="font-semibold text-artis-primary">
                      {getRouteImageReviewLabel(
                        selectedCoverCandidate.reviewStatus,
                        locale,
                      ).toLowerCase()}
                    </span>
                    .{' '}
                    {getRouteImageReviewDescription(
                      selectedCoverCandidate.reviewStatus,
                      locale,
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border border-artis-primary/30 bg-white font-bold text-artis-primary shadow-lg transition-colors hover:bg-gray-50"
                  asChild
                >
                  <Link href={`/rutas/crear?routeId=${parsedId}`}>
                    <IconEdit size={18} />
                    {t('routeDetail.editRoute')}
                  </Link>
                </Button>
                <DeleteRouteButton routeId={parsedId} />
              </div>
            </div>
          </div>
        </section>

        {route.contributedImages.length > 0 && (
          <section className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-row items-center gap-4 pb-6">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-artis-primary">
                {t('routeDetail.gallery')}
              </h2>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {route.contributedImages.map((image) => {
                const reviewTone = getRouteImageReviewTone(image.reviewStatus)

                return (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7]"
                  >
                    <div className="relative h-40 bg-[#efe4d2] md:h-44">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image}
                        alt={t('routeDetail.imageAlt', { name: route.name })}
                        className="h-full w-full object-cover"
                      />
                      {image.selectedForCover && (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-artis-primary">
                          <IconStar size={14} />
                          {t('routeDetail.candidateCover')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 p-4">
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                          reviewTone === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : reviewTone === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {getRouteImageReviewLabel(image.reviewStatus, locale)}
                      </span>
                      <p className="text-sm leading-6 text-gray-600">
                        {getRouteImageReviewDescription(image.reviewStatus, locale)}
                      </p>
                    </div>
                  </article>
                )
              })}
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
