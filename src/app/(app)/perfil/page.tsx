'use client'

import { logout } from '@/actions/user.actions'
import { RouteCard } from '@/app/(app)/components/RouteCard'
import { Button } from '@/shared/components/ui/button'
import { useMyRoutes } from '@/shared/hooks/useMyRoutes'
import { useUserStore } from '@/shared/stores/useUserStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

export default function Page() {
  const router = useRouter()
  const { user, isLoading, setUser } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
      setUser: state.setUser,
    })),
  )
  const { myRoutes, isLoading: isRoutesLoading } = useMyRoutes()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await logout()
    } finally {
      setIsSigningOut(false)
    }

    setUser(null)
    router.push('/login')
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border bg-slate-100">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={`Avatar de ${user.fullname}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Sin avatar
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
              {!isLoading && user && (
                <p className="text-slate-600">{user.fullname}</p>
              )}
              {isLoading && (
                <p className="text-slate-400">Cargando usuario...</p>
              )}
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
          </Button>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Mis rutas</h2>

          {isRoutesLoading && (
            <p className="text-slate-500">Cargando rutas...</p>
          )}

          {!isRoutesLoading && myRoutes.length === 0 && (
            <p className="text-slate-500">
              Aun no tienes rutas creadas.
            </p>
          )}

          {!isRoutesLoading && myRoutes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {myRoutes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
