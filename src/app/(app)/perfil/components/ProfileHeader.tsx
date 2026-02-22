'use client'

import { logout } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
import { useUserStore } from '@/shared/stores/useUserStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

export function ProfileHeader() {
  const router = useRouter()
  const { user, isLoading, setUser } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
      setUser: state.setUser,
    })),
  )
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
  )
}
