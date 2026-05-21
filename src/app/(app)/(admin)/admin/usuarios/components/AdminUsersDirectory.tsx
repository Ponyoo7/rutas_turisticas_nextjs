'use client'

import { getAdminUsers, type AdminUserListItem } from '@/actions/admin.actions'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { IconLoader2 } from '@tabler/icons-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { AdminEmptyState } from '../../components/AdminEmptyState'
import { UserVerificationButton } from './UserVerificationButton'

const roleStyles = {
  master: 'bg-artis-primary text-white',
  admin: 'bg-[#d7c2aa] text-artis-primary',
  user: 'bg-[#f6efe6] text-gray-700',
}

interface Props {
  initialUsers: AdminUserListItem[]
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

export function AdminUsersDirectory({
  initialUsers,
  initialQuery = '',
}: Props) {
  const { t } = useI18n()
  const normalizedInitialQuery = initialQuery.trim()
  const [query, setQuery] = useState(normalizedInitialQuery)
  const [appliedQuery, setAppliedQuery] = useState(normalizedInitialQuery)
  const [users, setUsers] = useState(initialUsers)
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

    getAdminUsers(nextQuery)
      .then((nextUsers) => {
        if (!active || requestIdRef.current !== requestId) return

        startTransition(() => {
          setUsers(nextUsers)
          setAppliedQuery(nextQuery)
          setError(null)
          setFailedQuery(null)
          lastResolvedQueryRef.current = nextQuery
        })
      })
      .catch(() => {
        if (!active || requestIdRef.current !== requestId) return

        setError(t('admin.users.searchError'))
        setFailedQuery(nextQuery)
      })

    return () => {
      active = false
    }
  }, [debouncedQuery, startTransition, t])

  const isLoading =
    (normalizedQuery !== appliedQuery && normalizedQuery !== failedQuery) ||
    isPending
  const roleLabels = {
    master: t('admin.users.roles.master'),
    admin: t('admin.users.roles.admin'),
    user: t('admin.users.roles.user'),
  }

  const handleVerifiedChange = (userId: string, verified: boolean) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, verified } : user,
      ),
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              {t('admin.users.eyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              {t('admin.users.title')}
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
            {isLoading && <IconLoader2 size={16} className="animate-spin" />}
            {t('admin.users.count', {
              count: users.length,
              suffix: users.length === 1 ? '' : 's',
            })}
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          {t('admin.users.description')}
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
              placeholder={t('admin.users.searchPlaceholder')}
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
              ? t('admin.users.showingResults', { query: appliedQuery })
              : t('admin.users.showingAll')}
          </p>
          <p>
            {isLoading ? t('admin.shared.searchingDatabase') : t('admin.users.order')}
          </p>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>

      {users.length === 0 ? (
        <AdminEmptyState
          title={
            appliedQuery
              ? t('admin.users.emptySearchTitle')
              : t('admin.users.emptyTitle')
          }
          description={
            appliedQuery
              ? t('admin.users.emptySearchDescription')
              : t('admin.users.emptyDescription')
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-artis-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-artis-primary/10">
              <thead className="bg-[#f8f5f0]">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.id')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.email')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.fullname')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.role')}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.verified')}
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    {t('admin.users.columns.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-artis-primary/10">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="align-top transition-colors hover:bg-[#fcfaf7]"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-500">
                      <span className="rounded-full bg-[#f8f5f0] px-3 py-1 font-mono text-xs text-artis-primary">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-serif text-lg font-bold text-artis-primary">
                        {user.fullname}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${roleStyles[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                          user.verified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {user.verified
                          ? t('admin.users.verifiedState')
                          : t('admin.users.pendingState')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {user.role === 'user' ? (
                        <div className="flex justify-end">
                          <UserVerificationButton
                            userId={user.id}
                            verified={user.verified}
                            onVerifiedChange={handleVerifiedChange}
                          />
                        </div>
                      ) : null}
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
