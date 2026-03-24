'use client'

import { formatDuration, getRouteStats } from '@/lib/utils'
import { Route } from '@/shared/types/routes'
import { useRouter } from 'next/navigation'
import { FavoriteRouteButton } from './FavoriteRouteButton'

interface Props {
  route: Route
  initialIsFavorite?: boolean
  primaryBadge?: string
  secondaryBadge?: string | null
  onFavoriteChange?: (isFavorite: boolean) => void
  href?: string
}

export function FeaturedRouteCard({
  route,
  initialIsFavorite = false,
  primaryBadge = 'Destacada',
  secondaryBadge = null,
  onFavoriteChange,
  href,
}: Props) {
  const router = useRouter()
  const stats = getRouteStats(route.places)
  const previewPlaces = route.places.slice(0, 2)

  const navigateToRoute = () => {
    if (!href) return

    router.push(href)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!href) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      router.push(href)
    }
  }

  return (
    <article
      className={`h-full overflow-hidden rounded-[24px] border border-artis-primary/10 bg-white shadow-sm ${
        href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
      }`}
      onClick={navigateToRoute}
      onKeyDown={handleKeyDown}
      role={href ? 'link' : undefined}
      tabIndex={href ? 0 : undefined}
    >
      <div className="relative h-40 bg-[#efe4d2]">
        <FavoriteRouteButton
          routeId={route.id}
          initialIsFavorite={initialIsFavorite}
          onFavoriteChange={onFavoriteChange}
          className="absolute right-4 top-4 z-10"
        />

        {route.image ? (
          // Route images can come from external dynamic URLs not covered by next/image config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.image}
            alt={`Imagen de la ruta ${route.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#eadbc6] via-[#f8f2ea] to-[#d9ccb7]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-artis-primary">
            {primaryBadge}
          </span>
          {secondaryBadge && (
            <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {secondaryBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-artis-primary/45">
            Ruta recomendada
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold text-artis-primary">
            {route.name}
          </h3>
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
              Paradas
            </p>
            <p className="mt-1 text-sm font-bold text-artis-primary">
              {stats.placesCount}
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
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-artis-primary">
            Primeras paradas
          </p>
          <div className="flex flex-wrap gap-2">
            {previewPlaces.map((place, index) => (
              <span
                key={`${route.id}-${place.type}-${place.id}-${index}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#fcfaf7] px-3 py-2 text-xs font-medium text-gray-700"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-artis-primary text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                {place.tags.name ?? 'Punto sin nombre'}
              </span>
            ))}
          </div>
          {route.places.length > previewPlaces.length && (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              +{route.places.length - previewPlaces.length} paradas mas
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
