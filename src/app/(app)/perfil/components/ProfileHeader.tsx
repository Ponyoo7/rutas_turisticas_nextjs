'use client'

import { logout } from '@/actions/user.actions'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { useUserStore } from '@/shared/stores/useUserStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

export function ProfileHeader() {
  const router = useRouter()
  const { t } = useI18n()
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
    <header className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-artis-background-light shadow-md dark:border-gray-800">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={t('profile.header.avatarAlt', { name: user.fullname })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
              {t('profile.header.noAvatar')}
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-artis-primary/60 dark:text-gray-400">
            {t('profile.header.welcomeBack')}
          </p>
          <h1 className="font-serif text-3xl font-bold text-artis-primary dark:text-white">
            {isLoading || !user ? t('common.loading') : user.fullname}
          </h1>
          <p className="mt-1 text-gray-500">{user?.email}</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="rounded-xl border border-red-200 bg-white font-bold text-red-600 shadow-lg transition-colors hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
        disabled={isSigningOut}
      >
        {isSigningOut ? t('profile.header.signingOut') : t('common.closeSession')}
      </Button>
    </header>
  )
}
