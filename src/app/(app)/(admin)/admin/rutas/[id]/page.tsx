import {
  getRouteImageReviewDescription,
  getRouteImageReviewLabel,
  getRouteImageReviewTone,
} from '@/lib/route-images'
import { getAdminRouteById } from '@/actions/admin.actions'
import { getTranslations } from '@/shared/i18n/server'
import { getPlaceCoords, getPlaceTypeLabel } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { IconStar } from '@tabler/icons-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { locale, t } = await getTranslations()
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const route = await getAdminRouteById(parsedId)

  if (!route) notFound()

  const galleryCountSuffix =
    route.contributedImages.length === 1 ? '' : locale === 'es' ? 'es' : 's'
  const savedPlaceSuffix =
    route.places.length === 1 ? '' : locale === 'es' ? 'es' : 's'
  const savedPlacePluralSuffix =
    route.places.length === 1 ? '' : locale === 'es' ? 's' : ''

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              {t('admin.routes.detail.eyebrow', { id: route.id })}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-artis-primary md:text-4xl">
              {route.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
              {t('admin.routes.detail.description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-artis-primary/15 bg-white text-artis-primary hover:bg-[#f8f5f0]"
            >
              <Link href="/admin/rutas">{t('admin.shared.backToList')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-artis-primary/15 bg-white text-artis-primary hover:bg-[#f8f5f0]"
            >
              <Link href="/admin/imagenes">
                {t('admin.shared.imageManagement')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#f7f1e8]">
            {route.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={route.image}
                alt={t('routeDetail.coverAlt', { name: route.name })}
                className="h-full min-h-[320px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-sm font-medium text-gray-500">
                {t('admin.routes.detail.noMainImage')}
              </div>
            )}
          </article>

          <div className="flex flex-col gap-4">
            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                {t('admin.routes.detail.owner')}
              </p>
              <p className="mt-3 font-serif text-2xl font-bold text-artis-primary">
                {route.ownerFullname}
              </p>
              <p className="mt-2 text-sm text-gray-600">{route.ownerEmail}</p>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                {t('admin.routes.detail.featuredStatus')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                    route.featured
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#f6efe6] text-gray-600'
                  }`}
                >
                  {route.featured
                    ? t('admin.routes.states.featured')
                    : t('admin.routes.states.notFeatured')}
                </span>
                <span className="text-sm text-gray-600">
                  {route.featured
                    ? t('admin.routes.detail.featuredReady')
                    : t('admin.routes.detail.featuredPending')}
                </span>
              </div>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                {t('admin.routes.detail.routeDescription')}
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {route.description || t('admin.routes.detail.missingDescription')}
              </p>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                {t('admin.routes.detail.visualSummary')}
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {t('admin.routes.detail.visualSummaryText', {
                  total: route.contributedImagesCount,
                  approved: route.approvedImagesCount,
                  pending: route.pendingImagesCount,
                  rejected: route.rejectedImagesCount,
                })}
              </p>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                {t('admin.routes.detail.itinerarySummary')}
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {t('admin.routes.detail.itinerarySummaryText', {
                  count: route.places.length,
                  suffix: savedPlaceSuffix,
                  pluralSuffix: savedPlacePluralSuffix,
                })}
              </p>
            </article>
          </div>
        </div>
      </div>

      {route.contributedImages.length > 0 && (
        <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
                {t('admin.routes.detail.galleryEyebrow')}
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
                {t('admin.routes.detail.galleryTitle')}
              </h2>
            </div>
            <span className="text-sm font-medium text-gray-500">
              {t('admin.routes.galleryCount', {
                count: route.contributedImages.length,
                suffix: galleryCountSuffix,
              })}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {route.contributedImages.map((image) => {
              const reviewTone = getRouteImageReviewTone(image.reviewStatus)

              return (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7]"
                >
                  <div className="relative h-52 bg-[#efe4d2]">
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
        </div>
      )}

      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              {t('admin.routes.detail.placesEyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              {t('admin.routes.detail.savedItinerary')}
            </h2>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {t('admin.routes.detail.stopsCount', {
              count: route.places.length,
              suffix: route.places.length === 1 ? '' : 's',
            })}
          </span>
        </div>

        {route.places.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-gray-600">
            {t('admin.routes.detail.noSavedPlaces')}
          </p>
        ) : (
          <ol className="mt-6 flex flex-col gap-4">
            {route.places.map((place, index) => {
              const coords = getPlaceCoords(place)

              return (
                <li
                  key={`${place.type}-${place.id}-${index}`}
                  className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                        {t('admin.routes.detail.stopLabel', { index: index + 1 })}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-artis-primary">
                        {place.tags.name ?? t('common.unnamedPoint')}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {getPlaceTypeLabel(place, locale)}
                      </p>
                    </div>

                    {coords && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
                        {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
                      </span>
                    )}
                  </div>

                  {place.tags.description && (
                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      {place.tags.description}
                    </p>
                  )}

                  {place.tags.website && (
                    <a
                      href={place.tags.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-artis-primary transition-opacity hover:opacity-80"
                    >
                      {t('admin.shared.officialWebsite')}
                    </a>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}
