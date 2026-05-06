'use client'

import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { useEffect, useTransition } from 'react'

/**
 * Componente de Error boundary que intercepta fallos ocurridos durante el proceso de
 * creación o edición de una ruta (por ej. errores de red). Permite intentar recargar.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h2>{t('routeBuilder.errors.serviceTitle')}</h2>
      <Button
        className="bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none transition-colors"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            reset()
          })
        }}
      >
        {isPending
          ? t('routeBuilder.errors.retrying')
          : t('routeBuilder.errors.retry')}
      </Button>
    </div>
  )
}
