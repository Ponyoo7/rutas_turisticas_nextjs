'use client'

import { getAdminRoutes, type AdminRouteListItem } from '@/actions/admin.actions'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { IconLoader2 } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import { AdminEmptyState } from '../../components/AdminEmptyState'
import { RouteFeaturedButton } from './RouteFeaturedButton'

interface Props {
  initialRoutes: AdminRouteListItem[]
  initialQuery?: string
}

const syncQueryWithUrl = (query: string) => {
  const url = new URL(window.location.href)

  if (query) {
    url.searchParams.set('q', query)
  } else {
    url.searchParams.delete('q')
  }

  window.history.replaceState(window.history.state, '', url)
}

export function AdminRoutesCatalog({
  initialRoutes,
  initialQuery = '',
}: Props) {
  const normalizedInitialQuery = initialQuery.trim()
  const [query, setQuery] = useState(normalizedInitialQuery)
  const [appliedQuery, setAppliedQuery] = useState(normalizedInitialQuery)
  const [routes, setRoutes] = useState(initialRoutes)
  const [error, setError] = useState<string | null>(null)
  const [failedQuery, setFailedQuery] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebouncedValue(query, 500)
  const lastResolvedQueryRef = useRef(normalizedInitialQuery)
  const requestIdRef = useRef(0)
  const normalizedQuery = query.trim()

  useEffect(() => {
    syncQueryWithUrl(query.trim())
  }, [query])

  useEffect(() => {
    const nextQuery = debouncedQuery.trim()

    if (nextQuery === lastResolvedQueryRef.current) return

    const requestId = ++requestIdRef.current
    let active = true

    getAdminRoutes(nextQuery)
      .then((nextRoutes) => {
        if (!active || requestIdRef.current !== requestId) return

        startTransition(() => {
          setRoutes(nextRoutes)
          setAppliedQuery(nextQuery)
          setError(null)
          setFailedQuery(null)
          lastResolvedQueryRef.current = nextQuery
        })
      })
      .catch(() => {
        if (!active || requestIdRef.current !== requestId) return

        setError('No se pudo actualizar la busqueda de rutas.')
        setFailedQuery(nextQuery)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery, startTransition])

  const isLoading =
    (normalizedQuery !== appliedQuery && normalizedQuery !== failedQuery) ||
    isPending

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              Rutas
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              Catalogo global de rutas
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
            {isLoading && <IconLoader2 size={16} className="animate-spin" />}
            {routes.length} rutas
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Vista administrativa para revisar autoria, estado destacado y acceso
          al detalle completo de cada ruta.
        </p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full lg:max-w-md">
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setError(null)
                setFailedQuery(null)
              }}
              placeholder="Buscar por ruta o propietario"
              className="h-11 rounded-xl border-artis-primary/15 bg-[#fcfaf7] px-4"
            />
          </div>

          {query && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery('')
                setError(null)
                setFailedQuery(null)
              }}
              className="rounded-xl border-artis-primary/15 bg-white text-artis-primary hover:bg-[#f8f5f0]"
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            {appliedQuery
              ? `Mostrando resultados para "${appliedQuery}".`
              : 'Mostrando todas las rutas disponibles.'}
          </p>
          <p>
            {isLoading
              ? 'Buscando en la base de datos...'
              : 'Busqueda por nombre de ruta o propietario.'}
          </p>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>

      {routes.length === 0 ? (
        <AdminEmptyState
          title={
            appliedQuery
              ? 'No hay resultados para esta busqueda'
              : 'Todavia no hay rutas creadas'
          }
          description={
            appliedQuery
              ? 'Prueba con otro nombre de ruta o con el nombre del usuario propietario.'
              : 'Cuando los usuarios empiecen a guardar rutas turisticas, apareceran aqui con su propietario y su estado editorial.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-artis-primary/10">
              <thead className="bg-[#f8f5f0]">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Ruta
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Usuario
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Featured
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Galeria
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-artis-primary/10">
                {routes.map((route) => (
                  <tr key={route.id} className="align-top transition-colors hover:bg-[#fcfaf7]">
                    <td className="px-4 py-4 text-sm font-medium text-gray-500">
                      <span className="rounded-full bg-[#f8f5f0] px-3 py-1 font-mono text-xs text-artis-primary">
                        {route.id}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/rutas/${route.id}`}
                        className="font-serif text-lg font-bold text-artis-primary transition-opacity hover:opacity-80"
                      >
                        {route.name}
                      </Link>
                      {route.description && (
                        <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                          {route.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-artis-primary/45">
                        Abrir detalle
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-base font-semibold text-artis-primary">
                        {route.ownerFullname}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {route.ownerEmail}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                          route.featured
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-[#f6efe6] text-gray-600'
                        }`}
                      >
                        {route.featured ? 'Destacada' : 'No destacada'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-artis-primary">
                        {route.contributedImagesCount} imagenes
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {route.approvedImagesCount} aprobadas,{' '}
                        {route.pendingImagesCount} pendientes,{' '}
                        {route.rejectedImagesCount} rechazadas
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <RouteFeaturedButton
                          routeId={route.id}
                          featured={route.featured}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
