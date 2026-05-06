'use client'

import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { useUserStore } from '@/shared/stores/useUserStore'
import Link from 'next/link'
import { useShallow } from 'zustand/shallow'

export const Navbar = () => {
  const { t } = useI18n()
  const { user, isLoading } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    })),
  )

  return (
    <nav className="col-span-2 h-18 p-4 flex flex-row justify-between items-center bg-transparent backdrop-blur-md dark:bg-black/20 transition-all duration-300">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" className="h-10" alt={t('navbar.logoAlt')} />
      <div className="flex flex-row justify-center items-center gap-4">
        <LanguageSwitcher compact />
        {user && (
          <Link
            href="/perfil"
            className="rounded-full overflow-hidden border-2 border-artis-primary/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-10 h-10 object-cover"
              src={user.image}
              alt={t('navbar.profileAlt')}
            />
          </Link>
        )}

        {!user && !isLoading && (
          <div className="flex flex-row gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-artis-primary font-bold hover:bg-artis-primary/5 rounded-lg transition-colors"
            >
              {t('navbar.login')}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-artis-primary text-white font-bold rounded-lg shadow-sm hover:bg-artis-primary/90 transition-colors"
            >
              {t('navbar.register')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
