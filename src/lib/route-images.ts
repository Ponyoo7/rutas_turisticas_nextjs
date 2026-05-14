import {
  MAX_ROUTE_DESCRIPTION_LENGTH,
  MAX_ROUTE_CONTRIBUTED_IMAGES,
  MAX_ROUTE_IMAGE_DIMENSION,
  MAX_ROUTE_IMAGE_UPLOAD_BYTES,
} from '@/shared/consts/routes'
import { getMessagesByLocale, Locale } from '@/shared/i18n/config'
import { translateMessage } from '@/shared/i18n/core'
import {
  RouteImageInput,
  RouteImageReviewStatus,
} from '@/shared/types/routes'

const INLINE_ROUTE_IMAGE_DATA_URL_REGEX =
  /^data:image\/(?:avif|gif|jpe?g|png|svg\+xml|webp);base64,[a-z0-9+/=]+$/i

export type InlineRouteImageDataUrl = `data:image/${string}`

const ROUTE_IMAGE_REVIEW_LABELS: Record<
  Locale,
  Record<RouteImageReviewStatus, string>
> = {
  es: {
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
  },
  en: {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  },
}

const ROUTE_IMAGE_REVIEW_DESCRIPTIONS: Record<
  Locale,
  Record<RouteImageReviewStatus, string>
> = {
  es: {
    approved: 'La imagen ya esta aprobada para formar parte de la ruta.',
    pending: 'La imagen esta esperando revision administrativa.',
    rejected: 'La imagen fue rechazada y no se mostrara publicamente.',
  },
  en: {
    approved: 'The image is already approved to be part of the route.',
    pending: 'The image is waiting for administrative review.',
    rejected: 'The image was rejected and will not be shown publicly.',
  },
}

const ROUTE_IMAGE_REVIEW_TONES: Record<RouteImageReviewStatus, string> = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'rejected',
}

const translateRouteBuilderMessage = (
  locale: Locale,
  key: string,
  values?: Record<string, string | number>,
) => translateMessage(getMessagesByLocale(locale), key, values)

export const normalizeRouteDescription = (value?: string | null) =>
  (value ?? '').trim().slice(0, MAX_ROUTE_DESCRIPTION_LENGTH)

export const isRouteInlineImageDataUrl = (
  value?: string | null,
): value is InlineRouteImageDataUrl => {
  if (typeof value !== 'string') return false

  return INLINE_ROUTE_IMAGE_DATA_URL_REGEX.test(value.trim())
}

export const getRouteInlineImageBytes = (dataUrl: string) => {
  const [, base64 = ''] = dataUrl.split(',', 2)
  const paddingLength = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0

  return Math.max(0, Math.floor((base64.length * 3) / 4) - paddingLength)
}

export const normalizeRouteImageReviewStatus = (
  value: unknown,
): RouteImageReviewStatus => {
  if (value === 'pending' || value === 'rejected') return value

  return 'approved'
}

export const getRouteImageReviewLabel = (
  status: RouteImageReviewStatus,
  locale: Locale = 'es',
) => ROUTE_IMAGE_REVIEW_LABELS[locale][status]

export const getRouteImageReviewDescription = (
  status: RouteImageReviewStatus,
  locale: Locale = 'es',
) => ROUTE_IMAGE_REVIEW_DESCRIPTIONS[locale][status]

export const getRouteImageReviewTone = (status: RouteImageReviewStatus) =>
  ROUTE_IMAGE_REVIEW_TONES[status]

export const normalizeRouteImageInputs = (
  images?: RouteImageInput[],
  locale: Locale = 'es',
): RouteImageInput[] => {
  if (!Array.isArray(images)) return []

  const normalizedImages = images
    .map((image) => ({
      id: typeof image.id === 'number' ? image.id : undefined,
      image: typeof image.image === 'string' ? image.image : '',
      selectedForCover: image.selectedForCover === true,
    }))
    .filter((image) => image.id !== undefined || image.image.trim())

  if (normalizedImages.length > MAX_ROUTE_CONTRIBUTED_IMAGES) {
    throw new Error(
      translateRouteBuilderMessage(locale, 'routeBuilder.errors.maxImagesPerRoute', {
        count: MAX_ROUTE_CONTRIBUTED_IMAGES,
      }),
    )
  }

  const selectedCount = normalizedImages.filter((image) => image.selectedForCover)
    .length

  if (selectedCount > 1) {
    throw new Error(
      translateRouteBuilderMessage(
        locale,
        'routeBuilder.errors.onlyOneCoverCandidate',
      ),
    )
  }

  return normalizedImages
}

const loadImage = (source: string, locale: Locale) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => {
      reject(
        new Error(
          translateRouteBuilderMessage(
            locale,
            'routeBuilder.errors.processSelectedImage',
          ),
        ),
      )
    }
    image.src = source
  })

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  return canvas
}

export const prepareRouteUploadImage = async (
  file: File,
  locale: Locale = 'es',
) => {
  if (!file.type.startsWith('image/')) {
    throw new Error(
      translateRouteBuilderMessage(
        locale,
        'routeBuilder.errors.selectValidImageFile',
      ),
    )
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl, locale)
    const scale = Math.min(
      1,
      MAX_ROUTE_IMAGE_DIMENSION / image.width,
      MAX_ROUTE_IMAGE_DIMENSION / image.height,
    )
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error(
        translateRouteBuilderMessage(
          locale,
          'routeBuilder.errors.prepareImageForUpload',
        ),
      )
    }

    // Convertimos la subida a JPEG para limitar el peso y facilitar la revision.
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const qualities = [0.88, 0.8, 0.72, 0.64, 0.56]

    for (const quality of qualities) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)

      if (getRouteInlineImageBytes(dataUrl) <= MAX_ROUTE_IMAGE_UPLOAD_BYTES) {
        return dataUrl
      }
    }

    throw new Error(
      translateRouteBuilderMessage(
        locale,
        'routeBuilder.errors.imageTooLargeAfterOptimization',
        {
          count: Math.round(MAX_ROUTE_IMAGE_UPLOAD_BYTES / 1024),
        },
      ),
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export {
  MAX_ROUTE_CONTRIBUTED_IMAGES,
  MAX_ROUTE_DESCRIPTION_LENGTH,
  MAX_ROUTE_IMAGE_UPLOAD_BYTES,
}
