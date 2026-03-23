import { AdminEmptyState } from '../components/AdminEmptyState'

export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
          Imagenes
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
          Moderación visual en preparación
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Esta sección queda lista como base de producto para una futura
          moderación de imágenes, revisión editorial o control de contenido
          visual asociado a rutas y lugares.
        </p>
      </div>

      <AdminEmptyState
        title="Próximamente"
        description="Todavía no existe un sistema de moderación de imágenes en Route Craft. Esta página actúa como placeholder bien integrado dentro del panel admin."
      />
    </section>
  )
}
