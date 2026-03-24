'use server'

import { CreateRoute, Route, UpdateRoute } from '@/shared/types/routes'
import { OSMElement } from '@/shared/types/locations'
import { locationsService } from '@/shared/services/locations.service'
import { cookies } from 'next/headers'
import { verifyToken } from './user.actions'
import { neon } from '@neondatabase/serverless'
import { revalidatePath } from 'next/cache'

type RouteRow = {
  id: number
  user_id: string | number
  name: string
  places: unknown
  image?: string | null
  featured?: unknown
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

const normalizeRoute = (route: RouteRow): Route => ({
  id: route.id,
  user_id: String(route.user_id),
  name: route.name,
  places: normalizePlaces(route.places),
  image: locationsService.toRenderableImageUrl(route.image) ?? '',
  featured: route.featured === true,
})

/**
 * Guarda una nueva ruta en la base de datos asociada al usuario autenticado.
 * Verifica la cookie de autenticación antes de ejecutar el INSERT.
 */
export const saveRoute = async (createRoute: CreateRoute) => {
  const { name, places, image } = createRoute
  const canonicalImage = locationsService.normalizeCanonicalImageUrl(image) ?? ''

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  await sql`INSERT INTO routes (user_id, name, places, image) values (${verified?.id}, ${name}, ${places}, ${canonicalImage})`

  return 'ok'
}

/**
 * Elimina una ruta de la base de datos dado su ID.
 * Por seguridad, también valida que la ruta pertenezca al usuario autenticado (`user_id = ...`).
 */
export const deleteRoute = async (id: number) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  await sql`DELETE FROM routes WHERE id = ${id} AND user_id = ${verified.id}`

  return 'ok'
}

/**
 * Actualiza los datos (nombre, lugares, imagen) de una ruta existente.
 * Valida que el `user_id` coincida con el del usuario autenticado para evitar
 * modificaciones no autorizadas por parte de otros usuarios.
 */
export const updateRoute = async ({ id, name, places, image }: UpdateRoute) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  if (typeof image === 'string') {
    const canonicalImage =
      locationsService.normalizeCanonicalImageUrl(image) ?? ''

    await sql`UPDATE routes SET name = ${name}, places = ${places}, image = ${canonicalImage} WHERE id = ${id} AND user_id = ${verified.id}`

    return 'ok'
  }

  await sql`UPDATE routes SET name = ${name}, places = ${places} WHERE id = ${id} AND user_id = ${verified.id}`

  return 'ok'
}

/**
 * Obtiene todas las rutas asociadas al usuario autenticado.
 * Normaliza los lugares (JSON -> Array de OSMElement) antes de devolverlos al cliente.
 */
export const getMyRoutes = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`SELECT * FROM routes WHERE user_id = ${verified.id}`

  return data.map((route) => normalizeRoute(route as RouteRow))
}

/**
 * Obtiene los detalles de una ruta específica por su ID.
 * Verifica que dicha ruta pertenezca al usuario actualmente autenticado,
 * devolviendo null si no existe o no tiene permisos.
 */
export const getMyRouteById = async (id: number): Promise<Route | null> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return null

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data =
    await sql`SELECT * FROM routes WHERE id = ${id} AND user_id = ${verified.id} LIMIT 1`

  if (data.length === 0) return null

  return normalizeRoute(data[0] as RouteRow)
}

export const getFeaturedRoutesByCityPlaces = async (
  cityPlaces: OSMElement[],
): Promise<Route[]> => {
  const cityPlaceIds = new Set(cityPlaces.map((place) => place.id))

  if (cityPlaceIds.size === 0) return []

  const sql = neon(`${process.env.DATABASE_URL}`)

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

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT *
    FROM routes
    WHERE id = ${routeId} AND featured = true
    LIMIT 1
  `

  if (data.length === 0) return null

  return normalizeRoute(data[0] as RouteRow)
}

export const getMyFavoriteRouteIds = async (): Promise<number[]> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return []

  const sql = neon(`${process.env.DATABASE_URL}`)

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
