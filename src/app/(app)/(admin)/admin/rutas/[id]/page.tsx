import { getAdminRouteById } from '@/actions/admin.actions'
import { getPlaceCoords, getPlaceTypeLabel } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound()

  const route = await getAdminRouteById(parsedId)

  if (!route) notFound()

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              Ruta #{route.id}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-artis-primary md:text-4xl">
              {route.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
              Detalle editorial de la ruta, con su autoria, imagen principal,
              lugares guardados y estado de destacado.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-xl border-artis-primary/15 bg-white text-artis-primary hover:bg-[#f8f5f0]"
          >
            <Link href="/admin/rutas">Volver al listado</Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="overflow-hidden rounded-[24px] border border-artis-primary/10 bg-[#f7f1e8]">
            {route.image ? (
              // Route images can come from external dynamic URLs not covered by next/image config.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={route.image}
                alt={`Imagen principal de ${route.name}`}
                className="h-full min-h-[280px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[280px] items-center justify-center px-6 text-center text-sm font-medium text-gray-500">
                Esta ruta no tiene imagen principal asignada.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                Usuario propietario
              </p>
              <p className="mt-3 font-serif text-2xl font-bold text-artis-primary">
                {route.ownerFullname}
              </p>
              <p className="mt-2 text-sm text-gray-600">{route.ownerEmail}</p>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                Estado featured
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                    route.featured
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#f6efe6] text-gray-600'
                  }`}
                >
                  {route.featured ? 'Destacada' : 'No destacada'}
                </span>
                <span className="text-sm text-gray-600">
                  {route.featured
                    ? 'Lista para usarse en superficies editoriales.'
                    : 'Aun no esta marcada para destacarse en el home.'}
                </span>
              </div>
            </article>

            <article className="rounded-[24px] border border-artis-primary/10 bg-[#fcfaf7] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/45">
                Resumen
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Esta ruta contiene {route.places.length}{' '}
                {route.places.length === 1 ? 'lugar guardado.' : 'lugares guardados.'}
              </p>
            </article>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              Places
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              Itinerario guardado
            </h2>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {route.places.length} paradas
          </span>
        </div>

        {route.places.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-gray-600">
            Esta ruta no tiene lugares guardados en este momento.
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
                        Parada {index + 1}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-artis-primary">
                        {place.tags.name ?? 'Punto sin nombre'}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {getPlaceTypeLabel(place)}
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
                      Visitar web oficial
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
