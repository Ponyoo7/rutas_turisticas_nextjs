'use client'

import { useUserStore } from '@/shared/stores/useUserStore'
import Link from 'next/link'
import { useShallow } from 'zustand/shallow'

export const Navbar = () => {
  const { user, isLoading } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    })),
  )

  return (
    <nav className="col-span-2 h-18 p-4 flex flex-row justify-between items-center bg-transparent backdrop-blur-md dark:bg-black/20 transition-all duration-300">
      <img src="/logo.svg" className="h-10" />
      <div className="flex flex-row justify-center items-center gap-4">
        {user && (
          <Link
            href="/perfil"
            className="rounded-full overflow-hidden border-2 border-artis-primary/20"
          >
            <img
              className="w-10 h-10 object-cover"
              src={user.image}
              alt="user profile"
            />
          </Link>
        )}

        {!user && !isLoading && (
          <div className="flex flex-row gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-artis-primary font-bold hover:bg-artis-primary/5 rounded-lg transition-colors"
            >
              Acceso
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-artis-primary text-white font-bold rounded-lg shadow-sm hover:bg-artis-primary/90 transition-colors"
            >
              Registro
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
