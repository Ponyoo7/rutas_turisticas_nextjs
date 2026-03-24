'use client'

import { getAdminUsers, type AdminUserListItem } from '@/actions/admin.actions'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
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

        setError('No se pudo actualizar la busqueda de usuarios.')
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
              Usuarios
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              Directorio de usuarios
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
            {isLoading && <IconLoader2 size={16} className="animate-spin" />}
            {users.length} usuarios
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Vista administrativa ordenada alfabeticamente por nombre para revisar
          identidad, email, rol y estado de verificacion.
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
              placeholder="Buscar por nombre o email"
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
              : 'Mostrando todos los usuarios del sistema.'}
          </p>
          <p>{isLoading ? 'Buscando en la base de datos...' : 'Orden: fullname A-Z.'}</p>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>

      {users.length === 0 ? (
        <AdminEmptyState
          title={
            appliedQuery
              ? 'No hay resultados para esta busqueda'
              : 'No hay usuarios para mostrar'
          }
          description={
            appliedQuery
              ? 'Prueba con otro nombre o email para localizar al usuario dentro del directorio administrativo.'
              : 'Cuando existan registros en la base de datos, apareceran aqui con su rol y estado de verificacion.'
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
                    Email
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Fullname
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Role
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Verified
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/55">
                    Acciones
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
                        {user.role}
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
                        {user.verified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        {user.role === 'user' ? (
                          <UserVerificationButton
                            userId={user.id}
                            verified={user.verified}
                          />
                        ) : (
                          <span className="rounded-full border border-artis-primary/15 bg-[#f8f5f0] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-artis-primary/70">
                            Sin edicion
                          </span>
                        )}
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
