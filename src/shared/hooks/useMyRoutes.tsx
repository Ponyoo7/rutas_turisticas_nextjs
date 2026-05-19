import { getMyRoutes } from '@/actions/routes.actions'
import { Route } from '@/shared/types/routes'
import { useEffect, useState } from 'react'

export const useMyRoutes = () => {
  const [myRoutes, setMyRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadRoutes = () => {
    setIsLoading(true)
    getMyRoutes()
      .then((data) => {
        setMyRoutes(data ?? [])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    let cancelled = false

    getMyRoutes()
      .then((data) => {
        if (cancelled) return

        setMyRoutes(data ?? [])
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
    myRoutes,
    isLoading,
    refetch: loadRoutes,
  }
}
