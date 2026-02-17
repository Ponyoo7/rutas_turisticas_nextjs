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
    router.push('/')
  }

  return (
    <main className="min-h-screen dark:bg-artis-background-dark p-6 md:p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-artis-background-light dark:border-gray-800 shadow-md">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={`Avatar de ${user.fullname}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-sm text-gray-400">
                  Sin avatar
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-artis-primary/60 dark:text-gray-400 mb-1">
                Bienvenido de nuevo
              </p>
              <h1 className="text-3xl font-bold font-serif text-artis-primary dark:text-white">
                {isLoading || !user ? 'Cargando...' : user.fullname}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-xl bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-bold shadow-lg border border-red-200 transition-colors"
            onClick={handleLogout}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </header>

        {/* My Routes Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold font-serif text-artis-primary dark:text-white">
              Mis rutas
            </h2>
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm font-medium text-gray-500">
              {myRoutes.length} rutas
            </span>
          </div>

          {isRoutesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-100 animate-pulse rounded-xl"
                ></div>
              ))}
            </div>
          )}

          {!isRoutesLoading && myRoutes.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-4 block">
                map
              </span>
              <p className="text-gray-500 font-medium">
                Aún no tienes rutas creadas.
              </p>
              <Button
                className="mt-4 bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none rounded-xl"
                onClick={() => router.push('/buscador')}
              >
                Crear mi primera ruta
              </Button>
            </div>
          )}

          {!isRoutesLoading && myRoutes.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
