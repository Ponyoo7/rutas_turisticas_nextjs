'use client'

import { useUserStore } from '@/shared/stores/useUserStore'
import { RouteCard } from './RouteCard'
import { useMyRoutes } from '@/shared/hooks/useMyRoutes'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

export const MyRoutes = () => {
  const { myRoutes } = useMyRoutes()
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return (
    <section className="mt-8 mb-24 px-6">
      <div className="flex flex-col gap-1 pb-6">
        <h2 className="text-artis-primary dark:text-gray-100 text-2xl font-bold tracking-tight font-serif">
          Mis rutas
        </h2>
        <p className="text-gray-500 text-sm">Created by you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myRoutes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes ninguna ruta creada</p>
            <Button className="bg-artis-primary text-white" asChild>
              <Link href="/buscador">Crea tu primera ruta</Link>
            </Button>
          </div>
        )}
        {myRoutes.map((r, i) => (
          <RouteCard key={i} route={r} />
        ))}
      </div>
    </section>
  )
}
