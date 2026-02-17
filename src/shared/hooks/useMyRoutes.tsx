import { useEffect, useState } from 'react'
import { Route } from '@/shared/types/routes'
import { getMyRoutes } from '@/actions/routes.actions'

export const useMyRoutes = () => {
  const [myRoutes, setMyRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadRoutes = () => {
    setIsLoading(true)
    getMyRoutes()
      .then((data) => {
        if (!data) return []

        setMyRoutes(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  return {
    myRoutes,
    isLoading,
    refetch: loadRoutes,
  }
}
