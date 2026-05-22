'use client'

import { AUTH_SYNC_STORAGE_KEY, parseAuthSyncPayload } from '@/lib/auth-sync'
import { useEffect } from 'react'

import { useUserStore } from '@/shared/stores/useUserStore'
import { User } from '@/shared/types/user'
import { useShallow } from 'zustand/shallow'

interface Props {
  user: User | undefined | null
}

export const UserProvider = ({ user }: Props) => {
  const { setIsLoading, setUser } = useUserStore(
    useShallow((state) => ({
      setUser: state.setUser,
      setIsLoading: state.setIsLoading,
    })),
  )

  useEffect(() => {
    if (user === undefined) return

    if (user || user === null) {
      setIsLoading(false)
    }

    setUser(user)
  }, [setIsLoading, setUser, user])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_STORAGE_KEY) return

      const payload = parseAuthSyncPayload(event.newValue)

      if (!payload) return

      setIsLoading(false)
      setUser(payload.type === 'login' ? payload.user : null)
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [setIsLoading, setUser])

  return <></>
}
