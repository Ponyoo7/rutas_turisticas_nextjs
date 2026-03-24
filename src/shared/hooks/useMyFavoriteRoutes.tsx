import { getMyFavoriteRoutes } from '@/actions/routes.actions'
import { Route } from '@/shared/types/routes'
import { useEffect, useState } from 'react'

export const useMyFavoriteRoutes = () => {
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadFavoriteRoutes = () => {
    setIsLoading(true)
    getMyFavoriteRoutes()
      .then((data) => {
        setFavoriteRoutes(data ?? [])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    let cancelled = false

    getMyFavoriteRoutes()
      .then((data) => {
        if (cancelled) return

        setFavoriteRoutes(data ?? [])
      })
      .finally(() => {
        if (cancelled) return

        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    favoriteRoutes,
    isLoading,
    refetch: loadFavoriteRoutes,
  }
}
