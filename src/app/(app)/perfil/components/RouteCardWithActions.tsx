'use client'

import { deleteRoute } from '@/actions/routes.actions'
import { formatDuration, getRouteStats } from '@/lib/utils'
import { Route } from '@/shared/types/routes'
import {
  IconArrowUpRight,
  IconEdit,
  IconLoader2,
  IconMapPin,
  IconRoute2,
  IconTrash,
} from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

interface RouteCardWithActionsProps {
  route: Route
  onDelete: () => void
}

/**
 * Tarjeta de perfil para rutas propias.
 * Prioriza una lectura mas comoda de la portada, la descripcion y las acciones
 * principales de edicion o eliminacion.
 */
export function RouteCardWithActions({
  route,
  onDelete,
}: RouteCardWithActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const stats = getRouteStats(route.places)
  const previewPlaces = route.places.slice(0, 3)
  const image = route.image || '/museo_placeholder.jpg'

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDeleting(true)
    try {
      await deleteRoute(route.id)
      onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#eadfce] bg-white shadow-[0_18px_45px_-28px_rgba(92,58,14,0.38)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(92,58,14,0.45)]">
      <Link
        href={`/rutas/${route.id}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artis-primary/30 focus-visible:ring-offset-4"
      >
        <div className="relative h-48 overflow-hidden bg-[#efe4d2]">
          {/* Route images can come from external dynamic URLs not covered by next/image config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`Imagen de la ruta ${route.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2f1707]/80 via-[#2f1707]/15 to-transparent" />

          <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/88 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-artis-primary shadow-sm backdrop-blur-sm">
            Mi ruta
          </div>

          <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <IconRoute2 size={14} />
              {stats.placesCount} paradas
            </span>
            <span className="inline-flex items-center rounded-full bg-white/88 px-3 py-1.5 text-[11px] font-semibold text-artis-primary shadow-sm backdrop-blur-sm">
              {formatDuration(stats.totalMinutes)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-artis-primary/45">
                  Ruta personal
                </p>
                <h3 className="mt-2 line-clamp-2 font-serif text-2xl font-bold leading-tight text-artis-primary">
                  {route.name}
                </h3>
              </div>
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfce] bg-[#fffaf4] text-artis-primary transition-transform duration-300 group-hover:-translate-y-0.5 md:inline-flex">
                <IconArrowUpRight size={18} />
              </span>
            </div>

            <p
              className={`text-sm leading-6 ${
                route.description
                  ? 'line-clamp-3 text-gray-600'
                  : 'text-gray-400 italic'
              }`}
            >
              {route.description ||
                'Todavia no has anadido una descripcion para esta ruta.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#fcfaf7] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                Duracion
              </p>
              <p className="mt-1 text-sm font-bold text-artis-primary">
                {formatDuration(stats.totalMinutes)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#fcfaf7] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                Distancia
              </p>
              <p className="mt-1 text-sm font-bold text-artis-primary">
                {stats.totalDistanceKm} km
              </p>
            </div>
            <div className="rounded-2xl bg-[#fcfaf7] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-artis-primary/45">
                Paradas
              </p>
              <p className="mt-1 text-sm font-bold text-artis-primary">
                {stats.placesCount}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-artis-primary/40">
              Primeras paradas
            </p>

            {previewPlaces.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewPlaces.map((place, index) => (
                  <span
                    key={`${route.id}-${place.type}-${place.id}-${index}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#fcfaf7] px-3 py-2 text-xs font-medium text-gray-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-artis-primary text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="truncate">
                      {place.tags.name ?? 'Parada sin nombre'}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fffaf4] px-4 py-3 text-sm text-gray-500">
                Esta ruta todavia no tiene paradas visibles.
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-[#f0e7da] bg-[#fffaf4] px-5 py-4">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-artis-primary/55">
          <IconMapPin size={14} />
          Gestiona tu ruta
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/rutas/crear?routeId=${route.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-semibold text-artis-primary transition-colors hover:bg-[#fff2df]"
            title="Editar ruta"
          >
            <IconEdit size={16} />
            Editar
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
            title="Eliminar ruta"
          >
            {isDeleting ? (
              <>
                <IconLoader2 className="animate-spin" size={16} />
                Eliminando...
              </>
            ) : (
              <>
                <IconTrash size={16} />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
