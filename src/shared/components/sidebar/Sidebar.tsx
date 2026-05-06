'use client'

import { canAccessAdmin } from '@/lib/auth'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { useUserStore } from '@/shared/stores/useUserStore'
import {
  IconChartBar,
  IconHome,
  IconPhoto,
  IconRoute,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/shallow'

export const Sidebar = () => {
  const { t } = useI18n()
  const pathname = usePathname()
  const { user, isLoading } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    })),
  )

  const showAdminSection = !isLoading && canAccessAdmin(user)
  const isAdminArea = pathname.startsWith('/admin')
  const baseItems = [
    {
      label: t('sidebar.home'),
      href: '/',
      icon: IconHome,
    },
    {
      label: t('sidebar.search'),
      href: '/buscador',
      icon: IconSearch,
    },
  ]
  const adminItems = [
    {
      label: t('sidebar.dashboard'),
      href: '/admin',
      icon: IconChartBar,
    },
    {
      label: t('sidebar.users'),
      href: '/admin/usuarios',
      icon: IconUsers,
    },
    {
      label: t('sidebar.routes'),
      href: '/admin/rutas',
      icon: IconRoute,
    },
    {
      label: t('sidebar.images'),
      href: '/admin/imagenes',
      icon: IconPhoto,
    },
  ]
  const getItemClasses = (isActive: boolean) =>
    `flex min-h-12 flex-1 flex-row items-center justify-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 md:justify-start ${
      isActive
        ? 'bg-artis-primary/10 font-bold text-artis-primary'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <aside className="w-full px-4 py-3 backdrop-blur-sm md:h-full md:w-80 md:px-5 md:py-7">
      <div className="flex flex-col gap-4">
        <nav className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          {baseItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                className={getItemClasses(isActive)}
              >
                <item.icon size={24} />
                <span className="text-[1.05rem] font-serif">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {showAdminSection && (
          <div className="pt-4">
            <div className="mb-3 flex items-center gap-3 px-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.3em] ${
                  isAdminArea ? 'text-artis-primary' : 'text-artis-primary/55'
                }`}
              >
                {t('sidebar.admin')}
              </span>
              <div className="h-px flex-1 bg-artis-primary/10"></div>
            </div>

            <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={getItemClasses(isActive)}
                  >
                    <item.icon size={24} />
                    <span className="text-[1.05rem] font-serif">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </aside>
  )
}
