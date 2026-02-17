'use client'

import { Button } from '@/shared/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full h-full flex flex-row items-center justify-center gap-4">
      <h2>Ha ocurrido un error con el servicio de OpenStreet</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => {
            reset()
            router.refresh()
          }
        }
      >
        Volver a intetarlo
      </Button>
    </div>
  )
}
