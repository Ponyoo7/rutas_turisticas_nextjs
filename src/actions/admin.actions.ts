'use server'

import { verifyToken } from '@/actions/user.actions'
import { canAccessAdmin } from '@/lib/auth'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement } from '@/shared/types/locations'
import { UserRole } from '@/shared/types/user'
import { neon } from '@neondatabase/serverless'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

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
  image?: string | null
  places?: unknown
  featured?: unknown
  user_id: string | number
  owner_fullname: string
  owner_email: string
}

type AdminUserVerificationRow = {
  role?: unknown
}

type AdminRouteFeaturedRow = {
  id: number
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
  image: string | null
  featured: boolean
  userId: string
  ownerFullname: string
  ownerEmail: string
}

export interface AdminRouteDetail {
  id: number
  name: string
  image: string | null
  featured: boolean
  userId: string
  ownerFullname: string
  ownerEmail: string
  places: OSMElement[]
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

const normalizeRole = (role: unknown): UserRole => {
  if (role === 'admin' || role === 'master') return role

  return 'user'
}

const normalizeVerified = (verified: unknown) => verified === true

const normalizeFeatured = (featured: unknown) => featured === true

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

const hasAdminAccess = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  return canAccessAdmin(user)
}

export const getAdminUsers = async (
  search = '',
): Promise<AdminUserListItem[]> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = neon(`${process.env.DATABASE_URL}`)
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

  const sql = neon(`${process.env.DATABASE_URL}`)
  const normalizedSearch = search.trim()

  const data = normalizedSearch
    ? await sql`
        SELECT
          routes.id,
          routes.name,
          routes.image,
          routes.featured,
          routes.user_id,
          users.fullname AS owner_fullname,
          users.email AS owner_email
        FROM routes
        INNER JOIN users ON users.id = routes.user_id
        WHERE routes.name ILIKE ${`%${normalizedSearch}%`}
          OR users.fullname ILIKE ${`%${normalizedSearch}%`}
        ORDER BY routes.id DESC
      `
    : await sql`
        SELECT
          routes.id,
          routes.name,
          routes.image,
          routes.featured,
          routes.user_id,
          users.fullname AS owner_fullname,
          users.email AS owner_email
        FROM routes
        INNER JOIN users ON users.id = routes.user_id
        ORDER BY routes.id DESC
      `

  return data.map((route) => {
    const row = route as AdminRouteRow

    return {
      id: row.id,
      name: row.name,
      image: locationsService.toRenderableImageUrl(row.image),
      featured: normalizeFeatured(row.featured),
      userId: String(row.user_id),
      ownerFullname: row.owner_fullname,
      ownerEmail: row.owner_email,
    }
  })
}

export const getAdminRouteById = async (
  routeId: number,
): Promise<AdminRouteDetail | null> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return null

  if (!Number.isInteger(routeId) || routeId <= 0) return null

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT
      routes.id,
      routes.name,
      routes.image,
      routes.places,
      routes.featured,
      routes.user_id,
      users.fullname AS owner_fullname,
      users.email AS owner_email
    FROM routes
    INNER JOIN users ON users.id = routes.user_id
    WHERE routes.id = ${routeId}
    LIMIT 1
  `

  if (data.length === 0) return null

  const row = data[0] as AdminRouteRow

  return {
    id: row.id,
    name: row.name,
    image: locationsService.toRenderableImageUrl(row.image),
    places: normalizePlaces(row.places),
    featured: normalizeFeatured(row.featured),
    userId: String(row.user_id),
    ownerFullname: row.owner_fullname,
    ownerEmail: row.owner_email,
  }
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

  const sql = neon(`${process.env.DATABASE_URL}`)

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

  const sql = neon(`${process.env.DATABASE_URL}`)

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

  revalidatePath('/admin/rutas')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/ciudad/[name]', 'page')
  revalidatePath(`/rutas/destacadas/${routeId}`)
  revalidatePath('/perfil')

  return {
    ok: true,
  }
}
