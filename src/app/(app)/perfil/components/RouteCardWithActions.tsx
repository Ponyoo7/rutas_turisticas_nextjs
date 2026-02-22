'use client'

import { deleteRoute } from '@/actions/routes.actions'
import { RouteCard } from '@/app/(app)/components/RouteCard'
import { Route } from '@/shared/types/routes'
import { IconEdit, IconLoader2, IconTrash } from '@tabler/icons-react'
import Link from 'next/link'
import { useState } from 'react'

interface RouteCardWithActionsProps {
  route: Route
  onDelete: () => void
}

export function RouteCardWithActions({
  route,
  onDelete,
}: RouteCardWithActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDeleting(true)
    try {
      await deleteRoute(route.id)
      onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative group">
      <RouteCard route={route} />
      <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link
          href={`/rutas/crear?routeId=${route.id}`}
          className="cursor-pointer p-2 bg-white/90 text-gray-400 hover:text-artis-primary rounded-full shadow-sm hover:bg-white"
          title="Editar ruta"
        >
          <IconEdit size={18} />
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="cursor-pointer p-2 bg-white/90 text-gray-400 hover:text-red-600 rounded-full shadow-sm hover:bg-white"
          title="Eliminar ruta"
        >
          {isDeleting ? (
            <IconLoader2 className="animate-spin" size={16} />
          ) : (
            <IconTrash size={18} />
          )}
        </button>
      </div>
    </div>
  )
}
