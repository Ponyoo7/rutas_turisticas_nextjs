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
    <nav className="col-span-2 h-18 border-b p-4 flex flex-row justify-between">
      <h1>asbdbasd</h1>
      <div className="flex flex-row justify-center gap-4">
        {user && (
          <Link href="/perfil">
            <img className="w-10" src={user.image} alt="user profile" />
          </Link>
        )}

        {!user && !isLoading && (
          <>
            <Link href="/login">Acceso</Link>
            <Link href="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  )
}
