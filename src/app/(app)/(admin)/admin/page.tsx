import { getAdminRoutes, getAdminUsers } from '@/actions/admin.actions'
import { getTranslations } from '@/shared/i18n/server'

export default async function Page() {
  const { t } = await getTranslations()
  const [users, routes] = await Promise.all([getAdminUsers(), getAdminRoutes()])
  const pendingImages = routes.reduce(
    (total, route) => total + route.pendingImagesCount,
    0,
  )
  const rejectedImages = routes.reduce(
    (total, route) => total + route.rejectedImagesCount,
    0,
  )

  return (
    <section className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
          {t('admin.dashboard.eyebrow')}
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary md:text-4xl">
          {t('admin.dashboard.title')}
        </h2>
        <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
          {t('admin.dashboard.description')}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            {t('admin.dashboard.visibleUsersTitle')}
          </p>
          <p className="mt-4 font-serif text-4xl font-bold text-artis-primary">
            {users.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {t('admin.dashboard.visibleUsersDescription')}
          </p>
        </article>

        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            {t('admin.dashboard.publishedRoutesTitle')}
          </p>
          <p className="mt-4 font-serif text-4xl font-bold text-artis-primary">
            {routes.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {t('admin.dashboard.publishedRoutesDescription')}
          </p>
        </article>

        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            {t('admin.dashboard.imageStatusTitle')}
          </p>
          <p className="mt-4 font-serif text-2xl font-bold text-artis-primary">
            {t('admin.dashboard.imageStatusValue', {
              pending: pendingImages,
              rejected: rejectedImages,
            })}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {t('admin.dashboard.imageStatusDescription')}
          </p>
        </article>
      </div>
    </section>
  )
}
