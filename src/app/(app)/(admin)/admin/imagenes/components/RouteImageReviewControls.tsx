'use client'

import { approveRouteImage, rejectRouteImage } from '@/actions/admin.actions'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { Button } from '@/shared/components/ui/button'
import { IconLoader2 } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Props {
  imageId: number
}

export function RouteImageReviewControls({ imageId }: Props) {
  const router = useRouter()
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleReview = (mode: 'approve' | 'reject') => {
    setError(null)

    startTransition(async () => {
      const result =
        mode === 'approve'
          ? await approveRouteImage(imageId)
          : await rejectRouteImage(imageId)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => handleReview('approve')}
          className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
        >
          {isPending ? (
            <>
              <IconLoader2 className="animate-spin" />
              {t('admin.images.buttons.saving')}
            </>
          ) : (
            t('admin.images.buttons.approve')
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => handleReview('reject')}
          className="border-rose-200 bg-white font-semibold text-rose-700 hover:bg-rose-50"
        >
          {t('admin.images.buttons.reject')}
        </Button>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  )
}
