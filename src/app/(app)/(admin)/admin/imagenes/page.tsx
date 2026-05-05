import { getAdminRouteImageQueue, getAdminRoutes } from '@/actions/admin.actions'
import {
  getRouteImageReviewDescription,
  getRouteImageReviewLabel,
  getRouteImageReviewTone,
} from '@/lib/route-images'
import Link from 'next/link'
import { AdminEmptyState } from '../components/AdminEmptyState'
import { RouteImageReviewControls } from './components/RouteImageReviewControls'

export default async function Page() {
  const [routes, queue] = await Promise.all([
    getAdminRoutes(),
    getAdminRouteImageQueue(),
  ])
  const pendingCount = routes.reduce(
    (total, route) => total + route.pendingImagesCount,
    0,
  )
  const rejectedCount = routes.reduce(
    (total, route) => total + route.rejectedImagesCount,
    0,
  )
  const approvedCount = routes.reduce(
    (total, route) => total + route.approvedImagesCount,
    0,
  )

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
          Imagenes
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
          Revision de imagenes aportadas
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Cola editorial para aprobar o rechazar las fotos que los usuarios han
          subido despues de completar sus rutas. Si una imagen aprobada esta
          marcada como candidata a portada, pasara a convertirse en la portada
          de la ruta.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
              Pendientes
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-artis-primary">
              {pendingCount}
            </p>
          </article>
          <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
              Rechazadas
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-artis-primary">
              {rejectedCount}
            </p>
          </article>
          <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
              Aprobadas
            </p>
            <p className="mt-3 font-serif text-4xl font-bold text-artis-primary">
              {approvedCount}
            </p>
          </article>
        </div>
      </div>

      {queue.length === 0 ? (
        <AdminEmptyState
          title="Sin revisiones pendientes"
          description="Todavia no hay imagenes de usuarios esperando una decision administrativa."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {queue.map((image) => {
            const reviewTone = getRouteImageReviewTone(image.reviewStatus)

            return (
              <article
                key={image.imageId}
                className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm"
              >
                <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(280px,0.78fr)_minmax(360px,1.22fr)]">
                  <div className="flex h-full flex-col border-b border-artis-primary/10 bg-[#fcfaf7] xl:border-b-0 xl:border-r">
                    <div className="border-b border-artis-primary/10 px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                        Imagen aportada
                      </p>
                    </div>
                    <div className="flex min-h-[220px] flex-1 items-center justify-center bg-[#efe4d2] p-4 xl:min-h-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image}
                        alt={`Imagen aportada a la ruta ${image.routeName}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#f8f5f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-artis-primary">
                        Ruta #{image.routeId}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                          reviewTone === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : reviewTone === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {getRouteImageReviewLabel(image.reviewStatus)}
                      </span>
                      {image.selectedForCover && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-artis-primary ring-1 ring-artis-primary/15">
                          Candidata a portada
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-artis-primary">
                        {image.routeName}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-gray-600">
                        {image.routeDescription ||
                          'La ruta todavia no incluye descripcion del autor.'}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                        Autor
                      </p>
                      <p className="mt-3 text-base font-semibold text-artis-primary">
                        {image.ownerFullname}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {image.ownerEmail}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-gray-600">
                      {getRouteImageReviewDescription(image.reviewStatus)}
                    </p>
                    {image.selectedForCover && (
                      <p className="text-sm leading-6 text-gray-600">
                        Si la apruebas, esta imagen pasara a convertirse en la
                        portada de la ruta.
                      </p>
                    )}

                    <RouteImageReviewControls imageId={image.imageId} />

                    <Link
                      href={`/admin/rutas/${image.routeId}`}
                      className="text-sm font-semibold text-artis-primary transition-opacity hover:opacity-80"
                    >
                      Abrir detalle completo de la ruta
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
