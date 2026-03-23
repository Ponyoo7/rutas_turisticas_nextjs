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

  return (
    <aside className="w-full border-t border-artis-primary/10 bg-white/80 px-4 py-3 backdrop-blur-sm md:h-full md:w-72 md:border-t-0 md:border-r md:px-4 md:py-6">
      <div className="flex flex-col gap-4">
        <nav className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          {baseItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl px-3 py-2 transition-colors duration-200 md:justify-start ${
                  isActive
                    ? 'bg-artis-primary/10 font-bold text-artis-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={22} />
                <span className="text-base font-serif">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {showAdminSection && (
          <div className="border-t border-artis-primary/10 pt-4">
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
                    className={`flex min-h-10 flex-1 flex-row items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-200 md:pl-5 ${
                      isActive
                        ? 'bg-artis-primary text-white shadow-sm'
                        : 'text-gray-600 hover:bg-[#f6efe6] hover:text-artis-primary'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
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
