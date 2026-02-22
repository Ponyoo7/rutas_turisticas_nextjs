'use client'

import { Button } from '@/shared/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h2>Ha ocurrido un error con el servicio de OpenStreet</h2>
      <Button
        className="bg-artis-primary text-white hover:bg-artis-primary/90 font-bold shadow-lg border-none transition-colors"
        disabled={isPending}
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => {
            window.location.reload()
          }
        }
      >
        {isPending ? 'Reintentando...' : 'Volver a intentarlo'}
      </Button>
    </div>
  )
}
