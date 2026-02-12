'use client'

import { useUserStore } from '@/shared/stores/useUserStore'
import { RouteCard } from './RouteCard'
import { useMyRoutes } from '@/shared/hooks/useMyRoutes'

export const MyRoutes = () => {
  const { myRoutes, isLoading } = useMyRoutes()
  const user = useUserStore((state) => state.user)

  return (
    <div className="flex flex-col gap-3">
      {user && (
        <>
          <h2 className="text-2xl font-bold">Mis rutas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {myRoutes.map((r, i) => (
              <RouteCard key={i} route={r} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
