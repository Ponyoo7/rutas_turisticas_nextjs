'use client'

import { deleteRoute } from '@/actions/routes.actions'
import { RouteCard } from '@/app/(app)/components/RouteCard'
import { IconLoader2, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

interface RouteCardWithActionsProps {
  route: any // Replace with proper type if available
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
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="cursor-pointer absolute bottom-2 right-2 p-2 bg-white/90 text-gray-400 hover:text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
        title="Eliminar ruta"
      >
        {isDeleting ? (
          <IconLoader2 className="animate-spin" size="16" />
        ) : (
          <IconTrash size={18} />
        )}
      </button>
    </div>
  )
}
