'use client'

import { updateUserVerified } from '@/actions/admin.actions'
import { Button } from '@/shared/components/ui/button'
import { IconLoader2 } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  userId: string
  verified: boolean
}

export function UserVerificationButton({ userId, verified }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextVerified = !verified

  const handleClick = async () => {
    setIsPending(true)
    setError(null)

    try {
      const result = await updateUserVerified(userId, nextVerified)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <Button
        onClick={handleClick}
        disabled={isPending}
        className={
          verified
            ? 'rounded-xl border border-amber-200 bg-white font-bold text-amber-700 shadow-sm hover:bg-amber-50'
            : 'rounded-xl bg-artis-primary font-bold text-white shadow-sm hover:bg-artis-primary/90'
        }
      >
        {isPending ? (
          <>
            <IconLoader2 size={16} className="animate-spin" />
            Guardando...
          </>
        ) : verified ? (
          'Quitar verificacion'
        ) : (
          'Verificar'
        )}
      </Button>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
