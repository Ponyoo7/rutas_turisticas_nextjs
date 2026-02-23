'use client'

import { deleteRoute } from '@/actions/routes.actions'
import { Button } from '@/shared/components/ui/button'
import { IconTrash, IconLoader2 } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteRouteButtonProps {
  routeId: number
}

/**
 * Botón para eliminar definitivamente una ruta.
 * Implementa un diálogo nativo de confirmación y hace uso de la Server Action `deleteRoute`.
 * Redirige a la página principal de "Mis Rutas" (/perfil) en caso de completarse con éxito.
 */
export function DeleteRouteButton({ routeId }: DeleteRouteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ruta?')) return

    setIsDeleting(true)
    try {
      await deleteRoute(routeId)
      router.push('/perfil')
    } catch (error) {
      console.error('Error deleting route:', error)
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl bg-white text-red-600 hover:bg-red-50 hover:text-red-700 font-bold shadow-lg border border-red-200 transition-colors gap-2 cursor-pointer"
    >
      {isDeleting ? (
        <>
          <IconLoader2 size={18} className="animate-spin" />
          Eliminando...
        </>
      ) : (
        <>
          <IconTrash size={18} />
          Borrar ruta
        </>
      )}
    </Button>
  )
}
