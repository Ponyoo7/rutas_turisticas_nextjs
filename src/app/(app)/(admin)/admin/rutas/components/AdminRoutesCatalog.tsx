'use client'

import { getAdminRoutes, type AdminRouteListItem } from '@/actions/admin.actions'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useI18n } from '@/shared/i18n/I18nProvider'
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
  const { locale, t } = useI18n()
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

        setError(t('admin.routes.searchError'))
        setFailedQuery(nextQuery)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery, startTransition, t])

  const galleryCountSuffix = (count: number) => {
    if (count === 1) return ''

    return locale === 'es' ? 'es' : 's'
  }

  const handleFeaturedChange = (routeId: number, featured: boolean) => {
    setRoutes((currentRoutes) =>
      currentRoutes.map((route) =>
        route.id === routeId ? { ...route, featured } : route,
      ),
    )
  }

  const isLoading =
    (normalizedQuery !== appliedQuery && normalizedQuery !== failedQuery) ||
    isPending

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              {t('admin.routes.eyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              {t('admin.routes.title')}
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
            {isLoading && <IconLoader2 size={16} className="animate-spin" />}
            {t('admin.routes.count', {
              count: routes.length,
              suffix: routes.length === 1 ? '' : 's',
            })}
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          {t('admin.routes.description')}
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
              placeholder={t('admin.routes.searchPlaceholder')}
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
              {t('admin.shared.clear')}
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            {appliedQuery
              ? t('admin.routes.showingResults', { query: appliedQuery })
              : t('admin.routes.showingAll')}
          </p>
          <p>
            {isLoading
              ? t('admin.shared.searchingDatabase')
              : t('admin.routes.searchHelp')}
          </p>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>

      {routes.length === 0 ? (
        <AdminEmptyState
          title={
            appliedQuery
              ? t('admin.routes.emptySearchTitle')
              : t('admin.routes.emptyTitle')
          }
          description={
            appliedQuery
              ? t('admin.routes.emptySearchDescription')
              : t('admin.routes.emptyDescription')
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-artis-primary/10">
              <thead className="bg-[#f8f5f0]">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.id')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.route')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.user')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.featured')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.gallery')}
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.routes.columns.actions')}
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
                        {t('admin.shared.openDetail')}
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
                        {route.featured
                          ? t('admin.routes.states.featured')
                          : t('admin.routes.states.notFeatured')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-artis-primary">
                        {t('admin.routes.galleryCount', {
                          count: route.contributedImagesCount,
                          suffix: galleryCountSuffix(route.contributedImagesCount),
                        })}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {t('admin.routes.galleryBreakdown', {
                          approved: route.approvedImagesCount,
                          pending: route.pendingImagesCount,
                          rejected: route.rejectedImagesCount,
                        })}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <RouteFeaturedButton
                          routeId={route.id}
                          featured={route.featured}
                          onFeaturedChange={handleFeaturedChange}
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
