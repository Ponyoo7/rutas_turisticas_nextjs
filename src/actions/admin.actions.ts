'use server'

import {
  normalizeRouteDescription,
  normalizeRouteImageReviewStatus,
} from '@/lib/route-images'
import { verifyToken } from '@/actions/user.actions'
import { canAccessAdmin } from '@/lib/auth'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement } from '@/shared/types/locations'
import { RouteImage, RouteImageReviewStatus } from '@/shared/types/routes'
import { UserRole } from '@/shared/types/user'
import { neon } from '@neondatabase/serverless'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const createSql = () => neon(`${process.env.DATABASE_URL}`)

type SqlClient = ReturnType<typeof createSql>

type AdminUserRow = {
  id: string | number
  fullname: string
  email: string
  role?: unknown
  verified?: unknown
}

type AdminRouteRow = {
  id: number
  name: string
  description?: string | null
  image?: string | null
  places?: unknown
  featured?: unknown
  user_id: string | number
  owner_fullname: string
  owner_email: string
  contributed_images_count?: number | string | null
  pending_images_count?: number | string | null
  rejected_images_count?: number | string | null
  approved_images_count?: number | string | null
}

type AdminRouteImageRow = {
  id: number | string
  route_id: number | string
  route_name: string
  route_description?: string | null
  route_image?: string | null
  image: string
  review_status?: unknown
  selected_for_cover?: unknown
  created_at?: Date | string | null
  owner_fullname: string
  owner_email: string
}

type AdminUserVerificationRow = {
  role?: unknown
}

type AdminRouteFeaturedRow = {
  id: number
}

type AdminRouteImageModerationRow = {
  id: number | string
  route_id: number | string
  image: string
  selected_for_cover?: unknown
}

export interface AdminUserListItem {
  id: string
  fullname: string
  email: string
  role: UserRole
  verified: boolean
}

export interface AdminRouteListItem {
  id: number
  name: string
  description: string
  image: string | null
  featured: boolean
  userId: string
  ownerFullname: string
  ownerEmail: string
  contributedImagesCount: number
  pendingImagesCount: number
  rejectedImagesCount: number
  approvedImagesCount: number
}

export interface AdminRouteDetail {
  id: number
  name: string
  description: string
  image: string | null
  featured: boolean
  userId: string
  ownerFullname: string
  ownerEmail: string
  places: OSMElement[]
  contributedImages: RouteImage[]
  contributedImagesCount: number
  pendingImagesCount: number
  rejectedImagesCount: number
  approvedImagesCount: number
}

export interface AdminRouteImageQueueItem {
  imageId: number
  routeId: number
  routeName: string
  routeDescription: string
  image: string
  reviewStatus: RouteImageReviewStatus
  selectedForCover: boolean
  createdAt: string
  ownerFullname: string
  ownerEmail: string
}

type UpdateUserVerifiedResult =
  | {
      ok: true
    }
  | {
      ok: false
      error: string
    }

type UpdateRouteFeaturedResult =
  | {
      ok: true
    }
  | {
      ok: false
      error: string
    }

type ReviewRouteImageResult =
  | {
      ok: true
    }
  | {
      ok: false
      error: string
    }

const normalizeRole = (role: unknown): UserRole => {
  if (role === 'admin' || role === 'master') return role

  return 'user'
}

const normalizeVerified = (verified: unknown) => verified === true

const normalizeFeatured = (featured: unknown) => featured === true

const normalizeCount = (value: unknown) => {
  const nextValue = Number(value)

  return Number.isFinite(nextValue) ? nextValue : 0
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

const normalizeAdminRouteImage = (image: AdminRouteImageRow): RouteImage => ({
  id: Number(image.id),
  image: locationsService.toRenderableImageUrl(image.image) ?? '',
  reviewStatus: normalizeRouteImageReviewStatus(image.review_status),
  selectedForCover: image.selected_for_cover === true,
  createdAt: image.created_at
    ? new Date(image.created_at).toISOString()
    : new Date(0).toISOString(),
})

const hasAdminAccess = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  return canAccessAdmin(user)
}

const buildAdminRouteBaseQuery = (normalizedSearch: string) => {
  if (normalizedSearch) {
    return {
      searchClause: true as const,
      searchValue: `%${normalizedSearch}%`,
    }
  }

  return {
    searchClause: false as const,
    searchValue: '',
  }
}

const revalidateAdminRouteSurfaces = (routeId?: number) => {
  revalidatePath('/')
  revalidatePath('/perfil')
  revalidatePath('/admin')
  revalidatePath('/admin/rutas')
  revalidatePath('/admin/imagenes')
  revalidatePath('/ciudad/[name]', 'page')

  if (routeId) {
    revalidatePath(`/admin/rutas/${routeId}`)
    revalidatePath(`/rutas/${routeId}`)
    revalidatePath(`/rutas/destacadas/${routeId}`)
  }
}

const getRouteImagesByRouteId = async (
  sql: SqlClient,
  routeId: number,
): Promise<RouteImage[]> => {
  const data = (await sql`
    SELECT id, route_id, image, review_status, selected_for_cover, created_at
    FROM route_images
    WHERE route_id = ${routeId}
    ORDER BY selected_for_cover DESC, created_at DESC, id DESC
  `) as AdminRouteImageRow[]

  return data.map((image) => normalizeAdminRouteImage(image))
}

export const getAdminUsers = async (
  search = '',
): Promise<AdminUserListItem[]> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = createSql()
  const normalizedSearch = search.trim()

  const data = normalizedSearch
    ? await sql`
        SELECT id, fullname, email, role, verified
        FROM users
        WHERE fullname ILIKE ${`%${normalizedSearch}%`}
          OR email ILIKE ${`%${normalizedSearch}%`}
        ORDER BY LOWER(fullname) ASC, LOWER(email) ASC
      `
    : await sql`
        SELECT id, fullname, email, role, verified
        FROM users
        ORDER BY LOWER(fullname) ASC, LOWER(email) ASC
      `

  return data.map((user) => {
    const row = user as AdminUserRow

    return {
      id: String(row.id),
      fullname: row.fullname,
      email: row.email,
      role: normalizeRole(row.role),
      verified: normalizeVerified(row.verified),
    }
  })
}

export const getAdminRoutes = async (
  search = '',
): Promise<AdminRouteListItem[]> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = createSql()
  const normalizedSearch = search.trim()
  const { searchClause, searchValue } = buildAdminRouteBaseQuery(normalizedSearch)

  const data = searchClause
    ? await sql`
        SELECT
          routes.id,
          routes.name,
          routes.description,
          routes.image,
          routes.featured,
          routes.user_id,
          users.fullname AS owner_fullname,
          users.email AS owner_email,
          COALESCE(image_stats.total_count, 0) AS contributed_images_count,
          COALESCE(image_stats.pending_count, 0) AS pending_images_count,
          COALESCE(image_stats.rejected_count, 0) AS rejected_images_count,
          COALESCE(image_stats.approved_count, 0) AS approved_images_count
        FROM routes
        INNER JOIN users ON users.id = routes.user_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*)::int AS total_count,
            COUNT(*) FILTER (WHERE review_status = 'pending')::int AS pending_count,
            COUNT(*) FILTER (WHERE review_status = 'rejected')::int AS rejected_count,
            COUNT(*) FILTER (WHERE review_status = 'approved')::int AS approved_count
          FROM route_images
          WHERE route_images.route_id = routes.id
        ) AS image_stats ON TRUE
        WHERE routes.name ILIKE ${searchValue}
          OR users.fullname ILIKE ${searchValue}
        ORDER BY routes.id DESC
      `
    : await sql`
        SELECT
          routes.id,
          routes.name,
          routes.description,
          routes.image,
          routes.featured,
          routes.user_id,
          users.fullname AS owner_fullname,
          users.email AS owner_email,
          COALESCE(image_stats.total_count, 0) AS contributed_images_count,
          COALESCE(image_stats.pending_count, 0) AS pending_images_count,
          COALESCE(image_stats.rejected_count, 0) AS rejected_images_count,
          COALESCE(image_stats.approved_count, 0) AS approved_images_count
        FROM routes
        INNER JOIN users ON users.id = routes.user_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*)::int AS total_count,
            COUNT(*) FILTER (WHERE review_status = 'pending')::int AS pending_count,
            COUNT(*) FILTER (WHERE review_status = 'rejected')::int AS rejected_count,
            COUNT(*) FILTER (WHERE review_status = 'approved')::int AS approved_count
          FROM route_images
          WHERE route_images.route_id = routes.id
        ) AS image_stats ON TRUE
        ORDER BY routes.id DESC
      `

  return data.map((route) => {
    const row = route as AdminRouteRow

    return {
      id: row.id,
      name: row.name,
      description: normalizeRouteDescription(row.description),
      image: locationsService.toRenderableImageUrl(row.image),
      featured: normalizeFeatured(row.featured),
      userId: String(row.user_id),
      ownerFullname: row.owner_fullname,
      ownerEmail: row.owner_email,
      contributedImagesCount: normalizeCount(row.contributed_images_count),
      pendingImagesCount: normalizeCount(row.pending_images_count),
      rejectedImagesCount: normalizeCount(row.rejected_images_count),
      approvedImagesCount: normalizeCount(row.approved_images_count),
    }
  })
}

export const getAdminRouteById = async (
  routeId: number,
): Promise<AdminRouteDetail | null> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return null

  if (!Number.isInteger(routeId) || routeId <= 0) return null

  const sql = createSql()

  const data = await sql`
    SELECT
      routes.id,
      routes.name,
      routes.description,
      routes.image,
      routes.places,
      routes.featured,
      routes.user_id,
      users.fullname AS owner_fullname,
      users.email AS owner_email,
      COALESCE(image_stats.total_count, 0) AS contributed_images_count,
      COALESCE(image_stats.pending_count, 0) AS pending_images_count,
      COALESCE(image_stats.rejected_count, 0) AS rejected_images_count,
      COALESCE(image_stats.approved_count, 0) AS approved_images_count
    FROM routes
    INNER JOIN users ON users.id = routes.user_id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*)::int AS total_count,
        COUNT(*) FILTER (WHERE review_status = 'pending')::int AS pending_count,
        COUNT(*) FILTER (WHERE review_status = 'rejected')::int AS rejected_count,
        COUNT(*) FILTER (WHERE review_status = 'approved')::int AS approved_count
      FROM route_images
      WHERE route_images.route_id = routes.id
    ) AS image_stats ON TRUE
    WHERE routes.id = ${routeId}
    LIMIT 1
  `

  if (data.length === 0) return null

  const row = data[0] as AdminRouteRow
  const contributedImages = await getRouteImagesByRouteId(sql, routeId)

  return {
    id: row.id,
    name: row.name,
    description: normalizeRouteDescription(row.description),
    image: locationsService.toRenderableImageUrl(row.image),
    places: normalizePlaces(row.places),
    featured: normalizeFeatured(row.featured),
    userId: String(row.user_id),
    ownerFullname: row.owner_fullname,
    ownerEmail: row.owner_email,
    contributedImages,
    contributedImagesCount: normalizeCount(row.contributed_images_count),
    pendingImagesCount: normalizeCount(row.pending_images_count),
    rejectedImagesCount: normalizeCount(row.rejected_images_count),
    approvedImagesCount: normalizeCount(row.approved_images_count),
  }
}

export const getAdminRouteImageQueue = async (): Promise<
  AdminRouteImageQueueItem[]
> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = createSql()

  const data = await sql`
    SELECT
      route_images.id,
      route_images.route_id,
      route_images.image,
      route_images.review_status,
      route_images.selected_for_cover,
      route_images.created_at,
      routes.name AS route_name,
      routes.description AS route_description,
      users.fullname AS owner_fullname,
      users.email AS owner_email
    FROM route_images
    INNER JOIN routes ON routes.id = route_images.route_id
    INNER JOIN users ON users.id = routes.user_id
    WHERE route_images.review_status = 'pending'
    ORDER BY
      route_images.created_at DESC,
      route_images.id DESC
  `

  return data.map((image) => {
    const row = image as AdminRouteImageRow

    return {
      imageId: Number(row.id),
      routeId: Number(row.route_id),
      routeName: row.route_name,
      routeDescription: normalizeRouteDescription(row.route_description),
      image: locationsService.toRenderableImageUrl(row.image) ?? '',
      reviewStatus: normalizeRouteImageReviewStatus(row.review_status),
      selectedForCover: row.selected_for_cover === true,
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date(0).toISOString(),
      ownerFullname: row.owner_fullname,
      ownerEmail: row.owner_email,
    }
  })
}

export const updateUserVerified = async (
  userId: string,
  verified: boolean,
): Promise<UpdateUserVerifiedResult> => {
  const allowed = await hasAdminAccess()

  if (!allowed) {
    return {
      ok: false,
      error: 'No tienes permisos para realizar esta accion.',
    }
  }

  if (!userId) {
    return {
      ok: false,
      error: 'Usuario no valido.',
    }
  }

  const sql = createSql()

  const userData = await sql`
    SELECT role
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `

  if (userData.length === 0) {
    return {
      ok: false,
      error: 'Usuario no encontrado.',
    }
  }

  const row = userData[0] as AdminUserVerificationRow
  const role = normalizeRole(row.role)

  if (role !== 'user') {
    return {
      ok: false,
      error: 'Solo se puede cambiar la verificacion de usuarios normales.',
    }
  }

  await sql`
    UPDATE users
    SET verified = ${verified}
    WHERE id = ${userId} AND role = 'user'
  `

  revalidatePath('/admin/usuarios')

  return {
    ok: true,
  }
}

export const updateRouteFeatured = async (
  routeId: number,
  featured: boolean,
): Promise<UpdateRouteFeaturedResult> => {
  const allowed = await hasAdminAccess()

  if (!allowed) {
    return {
      ok: false,
      error: 'No tienes permisos para realizar esta accion.',
    }
  }

  if (!Number.isInteger(routeId) || routeId <= 0) {
    return {
      ok: false,
      error: 'Ruta no valida.',
    }
  }

  const sql = createSql()

  const routeData = await sql`
    SELECT id
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

  const route = routeData[0] as AdminRouteFeaturedRow

  await sql`
    UPDATE routes
    SET featured = ${featured}
    WHERE id = ${route.id}
  `

  revalidateAdminRouteSurfaces(routeId)

  return {
    ok: true,
  }
}

export const approveRouteImage = async (
  imageId: number | string,
): Promise<ReviewRouteImageResult> => {
  const allowed = await hasAdminAccess()

  if (!allowed) {
    return {
      ok: false,
      error: 'No tienes permisos para realizar esta accion.',
    }
  }

  const normalizedImageId = normalizePositiveInteger(imageId)

  if (normalizedImageId === null) {
    return {
      ok: false,
      error: 'Imagen no valida.',
    }
  }

  const sql = createSql()

  const imageData = await sql`
    SELECT id, route_id, image, selected_for_cover
    FROM route_images
    WHERE id = ${normalizedImageId}
    LIMIT 1
  `

  if (imageData.length === 0) {
    return {
      ok: false,
      error: 'Imagen no encontrada.',
    }
  }

  const image = imageData[0] as AdminRouteImageModerationRow
  const normalizedRouteId = normalizePositiveInteger(image.route_id)

  if (normalizedRouteId === null) {
    return {
      ok: false,
      error: 'Ruta no valida.',
    }
  }

  await sql`
    UPDATE route_images
    SET review_status = 'approved'
    WHERE id = ${image.id}
  `

  if (image.selected_for_cover === true) {
    await sql`
      UPDATE routes
      SET image = ${image.image}
      WHERE id = ${normalizedRouteId}
    `
  }

  revalidateAdminRouteSurfaces(normalizedRouteId)

  return {
    ok: true,
  }
}

export const rejectRouteImage = async (
  imageId: number | string,
): Promise<ReviewRouteImageResult> => {
  const allowed = await hasAdminAccess()

  if (!allowed) {
    return {
      ok: false,
      error: 'No tienes permisos para realizar esta accion.',
    }
  }

  const normalizedImageId = normalizePositiveInteger(imageId)

  if (normalizedImageId === null) {
    return {
      ok: false,
      error: 'Imagen no valida.',
    }
  }

  const sql = createSql()

  const imageData = await sql`
    SELECT id, route_id
    FROM route_images
    WHERE id = ${normalizedImageId}
    LIMIT 1
  `

  if (imageData.length === 0) {
    return {
      ok: false,
      error: 'Imagen no encontrada.',
    }
  }

  const image = imageData[0] as AdminRouteImageModerationRow
  const normalizedRouteId = normalizePositiveInteger(image.route_id)

  if (normalizedRouteId === null) {
    return {
      ok: false,
      error: 'Ruta no valida.',
    }
  }

  await sql`
    UPDATE route_images
    SET review_status = 'rejected'
    WHERE id = ${image.id}
  `

  revalidateAdminRouteSurfaces(normalizedRouteId)

  return {
    ok: true,
  }
}
