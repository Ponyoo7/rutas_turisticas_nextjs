'use client'

import { IconHome, IconSearch } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
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

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="h-16 w-full border-t p-4 flex flex-row justify-around items-center gap-4 md:h-full md:w-62 md:border-t-0 md:border-r md:flex-col md:justify-start md:items-stretch">
      {menuItems.map((m) => {
        const isActive = pathname === m.href

        return (
          <Link
            key={m.label}
            href={m.href}
            className={`flex flex-row gap-2 items-center p-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'text-[#533d2d] font-bold bg-[#533d2d]/10'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <m.icon size={24} />
            <span className="text-lg">{m.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}
