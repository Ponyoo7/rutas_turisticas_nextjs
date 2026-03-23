import { getAdminRoutes, getAdminUsers } from '@/actions/admin.actions'

export default async function Page() {
  const [users, routes] = await Promise.all([getAdminUsers(), getAdminRoutes()])

  return (
    <section className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
          Resumen
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary md:text-4xl">
          Resumen operativo
        </h2>
        <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
          Vista general del panel admin con las metricas esenciales del estado
          actual del proyecto.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            Usuarios visibles
          </p>
          <p className="mt-4 font-serif text-4xl font-bold text-artis-primary">
            {users.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Total de usuarios accesibles desde la vista administrativa.
          </p>
        </article>

        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            Rutas publicadas
          </p>
          <p className="mt-4 font-serif text-4xl font-bold text-artis-primary">
            {routes.length}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Numero total de rutas registradas en el catalogo global.
          </p>
        </article>

        <article className="rounded-[24px] border border-artis-primary/10 bg-[#f8f5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-artis-primary/45">
            Estado de imagenes
          </p>
          <p className="mt-4 font-serif text-2xl font-bold text-artis-primary">
            Sin moderacion activa
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            La revision editorial de imagenes sigue pendiente para una proxima
            iteracion del panel.
          </p>
        </article>
      </div>
    </section>
  )
}
