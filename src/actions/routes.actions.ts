'use server'

import {
  MAX_ROUTE_IMAGE_UPLOAD_BYTES,
  getRouteInlineImageBytes,
  isRouteInlineImageDataUrl,
  normalizeRouteDescription,
  normalizeRouteImageInputs,
  normalizeRouteImageReviewStatus,
} from '@/lib/route-images'
import {
  CreateRoute,
  Route,
  RouteImage,
  RouteImageInput,
  UpdateRoute,
} from '@/shared/types/routes'
import { OSMElement } from '@/shared/types/locations'
import { locationsService } from '@/shared/services/locations.service'
import { cookies } from 'next/headers'
import { verifyToken } from './user.actions'
import { neon } from '@neondatabase/serverless'
import { revalidatePath } from 'next/cache'

const createSql = () => neon(`${process.env.DATABASE_URL}`)

type SqlClient = ReturnType<typeof createSql>

type RouteRow = {
  id: number
  user_id: string | number
  name: string
  description?: string | null
  places: unknown
  image?: string | null
  featured?: unknown
}

type RouteImageRow = {
  id: number | string
  route_id: number | string
  image: string
  review_status?: unknown
  selected_for_cover?: unknown
  created_at?: Date | string | null
}

type ToggleFavoriteRouteResult =
  | {
      ok: true
      favorited: boolean
    }
  | {
      ok: false
      error: string
    }

const normalizePlaces = (places: unknown): OSMElement[] => {
  if (Array.isArray(places)) return places as OSMElement[]

  if (typeof places === 'string') {
    try {
      const parsed = JSON.parse(places)
      return Array.isArray(parsed) ? (parsed as OSMElement[]) : []
    } catch {
      return []
    }
  }

  return []
}

const normalizePositiveInteger = (value: unknown): number | null => {
  const normalizedValue =
    typeof value === 'string' || typeof value === 'number'
      ? Number(value)
      : Number.NaN

  return Number.isInteger(normalizedValue) && normalizedValue > 0
    ? normalizedValue
    : null
}

const normalizeRouteImage = (source?: string | null) => {
  const canonicalImage = locationsService.normalizeCanonicalImageUrl(source)

  if (!canonicalImage) return ''

  if (
    isRouteInlineImageDataUrl(canonicalImage) &&
    getRouteInlineImageBytes(canonicalImage) > MAX_ROUTE_IMAGE_UPLOAD_BYTES
  ) {
    throw new Error('La imagen seleccionada supera el tamano permitido.')
  }

  return canonicalImage
}

const normalizeEditableRouteImages = (images?: RouteImageInput[]) =>
  normalizeRouteImageInputs(images).map((image) => ({
    id: normalizePositiveInteger(image.id),
    image: normalizeRouteImage(image.image),
    selectedForCover: image.selectedForCover,
  }))

const normalizeRouteImageRow = (image: RouteImageRow): RouteImage => ({
  id: Number(image.id),
  image: locationsService.toRenderableImageUrl(image.image) ?? '',
  reviewStatus: normalizeRouteImageReviewStatus(image.review_status),
  selectedForCover: image.selected_for_cover === true,
  createdAt: image.created_at
    ? new Date(image.created_at).toISOString()
    : new Date(0).toISOString(),
})

const normalizeRoute = (
  route: RouteRow,
  contributedImages: RouteImage[] = [],
): Route => ({
  id: route.id,
  user_id: String(route.user_id),
  name: route.name,
  description: normalizeRouteDescription(route.description),
  places: normalizePlaces(route.places),
  image: locationsService.toRenderableImageUrl(route.image) ?? '',
  contributedImages,
  featured: route.featured === true,
})

const getRouteImagesByRouteId = async (
  sql: SqlClient,
  routeId: number,
  options?: { approvedOnly?: boolean },
): Promise<RouteImage[]> => {
  const data = (options?.approvedOnly
    ? await sql`
        SELECT id, route_id, image, review_status, selected_for_cover, created_at
        FROM route_images
        WHERE route_id = ${routeId}
          AND review_status = 'approved'
        ORDER BY selected_for_cover DESC, created_at DESC, id DESC
      `
    : await sql`
        SELECT id, route_id, image, review_status, selected_for_cover, created_at
        FROM route_images
        WHERE route_id = ${routeId}
        ORDER BY selected_for_cover DESC, created_at DESC, id DESC
      `) as RouteImageRow[]

  return data.map((image) => normalizeRouteImageRow(image))
}

const applySelectedApprovedRouteCover = async (
  sql: SqlClient,
  routeId: number,
) => {
  const selectedApprovedImage = await sql`
    SELECT image
    FROM route_images
    WHERE route_id = ${routeId}
      AND selected_for_cover = TRUE
      AND review_status = 'approved'
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `

  if (selectedApprovedImage.length === 0) return

  await sql`
    UPDATE routes
    SET image = ${selectedApprovedImage[0].image}
    WHERE id = ${routeId}
  `
}

const syncRouteContributedImages = async (
  sql: SqlClient,
  routeId: number,
  images: RouteImageInput[],
) => {
  const normalizedImages = normalizeEditableRouteImages(images)
  const existingImages = (await sql`
    SELECT id
    FROM route_images
    WHERE route_id = ${routeId}
  `) as Array<{ id: number | string }>
  const existingImageIds = new Set(
    existingImages.map((image) => Number(image.id)),
  )

  for (const image of normalizedImages) {
    if (image.id !== null && !existingImageIds.has(image.id)) {
      throw new Error('Una de las imagenes seleccionadas ya no existe.')
    }
  }

  await sql`
    UPDATE route_images
    SET selected_for_cover = FALSE
    WHERE route_id = ${routeId}
  `

  for (const image of normalizedImages) {
    if (image.id !== null) {
      await sql`
        UPDATE route_images
        SET selected_for_cover = ${image.selectedForCover}
        WHERE id = ${image.id} AND route_id = ${routeId}
      `
      continue
    }

    await sql`
      INSERT INTO route_images (
        route_id,
        image,
        review_status,
        selected_for_cover
      )
      VALUES (
        ${routeId},
        ${image.image},
        'pending',
        ${image.selectedForCover}
      )
    `
  }

  await applySelectedApprovedRouteCover(sql, routeId)
}

const revalidateRouteSurfaces = (routeId?: number) => {
  revalidatePath('/')
  revalidatePath('/perfil')
  revalidatePath('/admin')
  revalidatePath('/admin/rutas')
  revalidatePath('/admin/imagenes')
  revalidatePath('/ciudad/[name]', 'page')

  if (routeId) {
    revalidatePath(`/rutas/${routeId}`)
    revalidatePath(`/rutas/destacadas/${routeId}`)
    revalidatePath(`/admin/rutas/${routeId}`)
  }
}

/**
 * Guarda una nueva ruta en la base de datos asociada al usuario autenticado.
 * Verifica la cookie de autenticacion antes de ejecutar el INSERT.
 */
export const saveRoute = async (createRoute: CreateRoute) => {
  const { name, description, places, image, contributedImages } = createRoute
  const normalizedName = name.trim()
  const normalizedDescription = normalizeRouteDescription(description)
  const canonicalImage =
    typeof image === 'string' ? normalizeRouteImage(image) : ''

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return null

  const sql = createSql()
  const insertedRoutes = await sql`
    INSERT INTO routes (user_id, name, description, places, image)
    VALUES (
      ${verified.id},
      ${normalizedName},
      ${normalizedDescription},
      ${places},
      ${canonicalImage}
    )
    RETURNING id
  `

  const routeId = Number(insertedRoutes[0]?.id)

  if (Number.isInteger(routeId) && contributedImages?.length) {
    await syncRouteContributedImages(sql, routeId, contributedImages)
  }

  revalidateRouteSurfaces(routeId)

  return routeId
}

/**
 * Elimina una ruta de la base de datos dado su ID.
 * Por seguridad, tambien valida que la ruta pertenezca al usuario autenticado (`user_id = ...`).
 */
export const deleteRoute = async (id: number) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = createSql()

  await sql`DELETE FROM routes WHERE id = ${id} AND user_id = ${verified.id}`

  revalidateRouteSurfaces(id)

  return 'ok'
}

/**
 * Actualiza los datos de una ruta existente.
 * Valida que el `user_id` coincida con el del usuario autenticado para evitar
 * modificaciones no autorizadas por parte de otros usuarios.
 */
export const updateRoute = async ({
  id,
  name,
  description,
  places,
  contributedImages,
}: UpdateRoute) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = createSql()
  const normalizedName = name.trim()
  const normalizedDescription = normalizeRouteDescription(description)

  await sql`
    UPDATE routes
    SET
      name = ${normalizedName},
      description = ${normalizedDescription},
      places = ${places}
    WHERE id = ${id} AND user_id = ${verified.id}
  `

  if (Array.isArray(contributedImages)) {
    await syncRouteContributedImages(sql, id, contributedImages)
  }

  revalidateRouteSurfaces(id)

  return 'ok'
}

/**
 * Obtiene todas las rutas asociadas al usuario autenticado.
 */
export const getMyRoutes = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = createSql()

  const data = await sql`SELECT * FROM routes WHERE user_id = ${verified.id}`

  return data.map((route) => normalizeRoute(route as RouteRow))
}

/**
 * Obtiene los detalles de una ruta especifica por su ID.
 * Verifica que dicha ruta pertenezca al usuario actualmente autenticado.
 */
export const getMyRouteById = async (id: number): Promise<Route | null> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return null

  const sql = createSql()

  const data =
    await sql`SELECT * FROM routes WHERE id = ${id} AND user_id = ${verified.id} LIMIT 1`

  if (data.length === 0) return null

  const contributedImages = await getRouteImagesByRouteId(sql, id)

  return normalizeRoute(data[0] as RouteRow, contributedImages)
}

export const getFeaturedRoutesByCityPlaces = async (
  cityPlaces: OSMElement[],
): Promise<Route[]> => {
  const cityPlaceIds = new Set(cityPlaces.map((place) => place.id))

  if (cityPlaceIds.size === 0) return []

  const sql = createSql()

  const data = await sql`
    SELECT *
    FROM routes
    WHERE featured = true
    ORDER BY id DESC
  `

  return data
    .map((route) => normalizeRoute(route as RouteRow))
    .map((route) => ({
      route,
      matchingPlacesCount: route.places.filter((place) => cityPlaceIds.has(place.id))
        .length,
    }))
    .filter(({ matchingPlacesCount }) => matchingPlacesCount > 0)
    .sort(
      (left, right) =>
        right.matchingPlacesCount - left.matchingPlacesCount ||
        right.route.id - left.route.id,
    )
    .slice(0, 6)
    .map(({ route }) => route)
}

export const getFeaturedRouteById = async (
  routeId: number,
): Promise<Route | null> => {
  if (!Number.isInteger(routeId) || routeId <= 0) return null

  const sql = createSql()

  const data = await sql`
    SELECT *
    FROM routes
    WHERE id = ${routeId} AND featured = true
    LIMIT 1
  `

  if (data.length === 0) return null

  const contributedImages = await getRouteImagesByRouteId(sql, routeId, {
    approvedOnly: true,
  })

  return normalizeRoute(data[0] as RouteRow, contributedImages)
}

export const getMyFavoriteRouteIds = async (): Promise<number[]> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return []

  const sql = createSql()

  const data = await sql`
    SELECT user_favorite_routes.route_id
    FROM user_favorite_routes
    INNER JOIN routes ON routes.id = user_favorite_routes.route_id
    WHERE user_favorite_routes.user_id = ${verified.id}
      AND routes.featured = true
  `

  return data
    .map((row) => Number(row.route_id))
    .filter((routeId) => Number.isInteger(routeId) && routeId > 0)
}

export const getMyFavoriteRoutes = async (): Promise<Route[]> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return []

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT routes.*
    FROM user_favorite_routes
    INNER JOIN routes ON routes.id = user_favorite_routes.route_id
    WHERE user_favorite_routes.user_id = ${verified.id}
      AND routes.featured = true
    ORDER BY user_favorite_routes.created_at DESC
  `

  return data.map((route) => normalizeRoute(route as RouteRow))
}

export const toggleFavoriteRoute = async (
  routeId: number,
): Promise<ToggleFavoriteRouteResult> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) {
    return {
      ok: false,
      error: 'Debes iniciar sesion para guardar favoritos.',
    }
  }

  if (!Number.isInteger(routeId) || routeId <= 0) {
    return {
      ok: false,
      error: 'Ruta no valida.',
    }
  }

  const sql = neon(`${process.env.DATABASE_URL}`)

  const existingFavorite = await sql`
    SELECT route_id
    FROM user_favorite_routes
    WHERE user_id = ${verified.id} AND route_id = ${routeId}
    LIMIT 1
  `

  if (existingFavorite.length > 0) {
    await sql`
      DELETE FROM user_favorite_routes
      WHERE user_id = ${verified.id} AND route_id = ${routeId}
    `

    revalidatePath('/perfil')
    revalidatePath(`/rutas/destacadas/${routeId}`)

    return {
      ok: true,
      favorited: false,
    }
  }

  const routeData = await sql`
    SELECT featured
    FROM routes
    WHERE id = ${routeId}
    LIMIT 1
  `

  if (routeData.length === 0) {
    return {
      ok: false,
      error: 'Ruta no encontrada.',
    }
  }

  if (routeData[0].featured !== true) {
    return {
      ok: false,
      error: 'Solo puedes guardar rutas destacadas como favoritas.',
    }
  }

  await sql`
    INSERT INTO user_favorite_routes (user_id, route_id)
    VALUES (${verified.id}, ${routeId})
  `

  revalidatePath('/perfil')
  revalidatePath(`/rutas/destacadas/${routeId}`)

  return {
    ok: true,
    favorited: true,
  }
}
