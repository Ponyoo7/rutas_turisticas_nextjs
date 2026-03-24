'use client'

import { toggleFavoriteRoute } from '@/actions/routes.actions'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { useUserStore } from '@/shared/stores/useUserStore'
import { Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

interface Props {
  routeId: number
  initialIsFavorite?: boolean
  className?: string
  onFavoriteChange?: (isFavorite: boolean) => void
  mode?: 'icon' | 'full'
}

export function FavoriteRouteButton({
  routeId,
  initialIsFavorite = false,
  className,
  onFavoriteChange,
  mode = 'icon',
}: Props) {
  const router = useRouter()
  const { user, isLoading } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      isLoading: state.isLoading,
    })),
  )
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const result = await toggleFavoriteRoute(routeId)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setIsFavorite(result.favorited)
      onFavoriteChange?.(result.favorited)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-end gap-2', className)}>
      <Button
        type="button"
        variant={mode === 'full' ? 'outline' : 'outline'}
        size={mode === 'full' ? 'sm' : 'icon-sm'}
        onClick={handleClick}
        disabled={isPending || isLoading}
        aria-pressed={isFavorite}
        className={cn(
          mode === 'full'
            ? 'rounded-xl border-artis-primary/20 bg-white text-artis-primary hover:bg-[#fcfaf7]'
            : 'rounded-full border-white/60 bg-white/90 text-artis-primary shadow-md backdrop-blur-sm hover:bg-white',
          isFavorite &&
            (mode === 'full'
              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'),
        )}
      >
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Heart className={cn(isFavorite && 'fill-current')} />
        )}
        {mode === 'full' && (
          <span>
            {isFavorite ? 'Guardada en favoritos' : 'Guardar en favoritos'}
          </span>
        )}
      </Button>

      {error && (
        <p className="max-w-40 rounded-xl bg-white/95 px-3 py-2 text-right text-[11px] font-medium text-red-600 shadow-sm">
          {error}
        </p>
      )}
    </div>
  )
}
