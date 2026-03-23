'use server'

import { verifyToken } from '@/actions/user.actions'
import { canAccessAdmin } from '@/lib/auth'
import { UserRole } from '@/shared/types/user'
import { neon } from '@neondatabase/serverless'
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
  user_id: string | number
  owner_fullname: string
  owner_email: string
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
  userId: string
  ownerFullname: string
  ownerEmail: string
}

const normalizeRole = (role: unknown): UserRole => {
  if (role === 'admin' || role === 'master') return role

  return 'user'
}

const normalizeVerified = (verified: unknown) => verified === true

const hasAdminAccess = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  return canAccessAdmin(user)
}

export const getAdminUsers = async (): Promise<AdminUserListItem[]> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT id, fullname, email, role, verified
    FROM users
    ORDER BY fullname ASC, email ASC
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

export const getAdminRoutes = async (): Promise<AdminRouteListItem[]> => {
  const allowed = await hasAdminAccess()

  if (!allowed) return []

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT
      routes.id,
      routes.name,
      routes.image,
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
      image: typeof row.image === 'string' && row.image.length > 0 ? row.image : null,
      userId: String(row.user_id),
      ownerFullname: row.owner_fullname,
      ownerEmail: row.owner_email,
    }
  })
}
