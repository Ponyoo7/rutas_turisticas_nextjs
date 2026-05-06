'use client'

import { deleteRoute } from '@/actions/routes.actions'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { IconLoader2, IconTrash } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteRouteButtonProps {
  routeId: number
}

export function DeleteRouteButton({ routeId }: DeleteRouteButtonProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('routeDetail.deleteConfirm'))) return

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
      className="cursor-pointer gap-2 rounded-xl border border-red-200 bg-white font-bold text-red-600 shadow-lg transition-colors hover:bg-red-50 hover:text-red-700"
    >
      {isDeleting ? (
        <>
          <IconLoader2 size={18} className="animate-spin" />
          {t('profile.myRoutes.deleting')}
        </>
      ) : (
        <>
          <IconTrash size={18} />
          {t('routeDetail.deleteButton')}
        </>
      )}
    </Button>
  )
}
