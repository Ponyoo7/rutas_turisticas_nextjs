'use client'

import { canAccessAdmin } from '@/lib/auth'
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

const baseItems = [
  {
    label: 'Inicio',
    href: '/',
    icon: IconHome,
  },
  {
    label: 'Buscador',
    href: '/buscador',
    icon: IconSearch,
  },
]

const adminItems = [
  {
    label: 'Resumen operativo',
    href: '/admin',
    icon: IconChartBar,
  },
  {
    label: 'Gestion de usuarios',
    href: '/admin/usuarios',
    icon: IconUsers,
  },
  {
    label: 'Gestion de rutas',
    href: '/admin/rutas',
    icon: IconRoute,
  },
  {
    label: 'Gestion de imagenes',
    href: '/admin/imagenes',
    icon: IconPhoto,
  },
]

export const Sidebar = () => {
  const pathname = usePathname()
  const { user, isLoading } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    })),
  )

  const showAdminSection = !isLoading && canAccessAdmin(user)
  const isAdminArea = pathname.startsWith('/admin')
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
                Admin
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
