import { getAdminRoutes } from '@/actions/admin.actions'
import { AdminEmptyState } from '../components/AdminEmptyState'

export default async function Page() {
  const routes = await getAdminRoutes()

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              Rutas
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              Catálogo global de rutas
            </h2>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {routes.length} rutas
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Vista editorial de solo lectura para revisar las rutas creadas, su
          propietario y la imagen principal asociada si existe.
        </p>
      </div>

      {routes.length === 0 ? (
        <AdminEmptyState
          title="Todavía no hay rutas creadas"
          description="Cuando los usuarios empiecen a guardar rutas turísticas, aparecerán aquí con su propietario e imagen principal."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {routes.map((route) => (
            <article
              key={route.id}
              className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm"
            >
              {route.image ? (
                <div className="h-52 w-full overflow-hidden bg-[#efe5d8]">
                  {/* Route images can come from external dynamic URLs not covered by next/image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={route.image}
                    alt={`Imagen principal de ${route.name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center bg-[#f7f1e8] px-6 text-center text-sm font-medium text-gray-500">
                  Sin imagen principal
                </div>
              )}

              <div className="flex flex-col gap-4 p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/45">
                    Ruta #{route.id}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-bold text-artis-primary">
                    {route.name}
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#f8f5f0] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                    Propietario
                  </p>
                  <p className="mt-3 text-base font-semibold text-artis-primary">
                    {route.ownerFullname}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {route.ownerEmail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
