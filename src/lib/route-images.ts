import {
  MAX_ROUTE_DESCRIPTION_LENGTH,
  MAX_ROUTE_CONTRIBUTED_IMAGES,
  MAX_ROUTE_IMAGE_DIMENSION,
  MAX_ROUTE_IMAGE_UPLOAD_BYTES,
} from '@/shared/consts/routes'
import {
  RouteImageInput,
  RouteImageReviewStatus,
} from '@/shared/types/routes'

const INLINE_ROUTE_IMAGE_DATA_URL_REGEX =
  /^data:image\/(?:avif|gif|jpe?g|png|svg\+xml|webp);base64,[a-z0-9+/=]+$/i

export type InlineRouteImageDataUrl = `data:image/${string}`

const ROUTE_IMAGE_REVIEW_LABELS: Record<RouteImageReviewStatus, string> = {
  approved: 'Aprobada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
}

const ROUTE_IMAGE_REVIEW_DESCRIPTIONS: Record<RouteImageReviewStatus, string> = {
  approved: 'La imagen ya esta aprobada para formar parte de la ruta.',
  pending: 'La imagen esta esperando revision administrativa.',
  rejected: 'La imagen fue rechazada y no se mostrara publicamente.',
}

const ROUTE_IMAGE_REVIEW_TONES: Record<RouteImageReviewStatus, string> = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'rejected',
}

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

export const getRouteImageReviewLabel = (status: RouteImageReviewStatus) =>
  ROUTE_IMAGE_REVIEW_LABELS[status]

export const getRouteImageReviewDescription = (
  status: RouteImageReviewStatus,
) => ROUTE_IMAGE_REVIEW_DESCRIPTIONS[status]

export const getRouteImageReviewTone = (status: RouteImageReviewStatus) =>
  ROUTE_IMAGE_REVIEW_TONES[status]

export const normalizeRouteImageInputs = (
  images?: RouteImageInput[],
): RouteImageInput[] => {
  if (!Array.isArray(images)) return []

  const normalizedImages = images
    .map((image) => ({
      id: typeof image.id === 'number' ? image.id : undefined,
      image: image.image,
      selectedForCover: image.selectedForCover === true,
    }))
    .filter((image) => typeof image.image === 'string' && image.image.trim())

  if (normalizedImages.length > MAX_ROUTE_CONTRIBUTED_IMAGES) {
    throw new Error(
      `Solo puedes guardar hasta ${MAX_ROUTE_CONTRIBUTED_IMAGES} imagenes por ruta.`,
    )
  }

  const selectedCount = normalizedImages.filter((image) => image.selectedForCover)
    .length

  if (selectedCount > 1) {
    throw new Error('Solo puedes seleccionar una imagen como candidata a portada.')
  }

  return normalizedImages
}

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () =>
      reject(new Error('No se pudo procesar la imagen seleccionada.'))
    image.src = source
  })

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  return canvas
}

export const prepareRouteUploadImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen valido.')
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
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
      throw new Error('No se pudo preparar la imagen para subirla.')
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
      `La imagen sigue siendo demasiado pesada tras optimizarla. Usa una de menos de ${Math.round(MAX_ROUTE_IMAGE_UPLOAD_BYTES / 1024)} KB.`,
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
