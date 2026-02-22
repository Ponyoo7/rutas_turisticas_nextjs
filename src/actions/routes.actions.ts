'use server'

import { CreateRoute, Route, UpdateRoute } from '@/shared/types/routes'
import { OSMElement } from '@/shared/types/locations'
import { cookies } from 'next/headers'
import { verifyToken } from './user.actions'
import { neon } from '@neondatabase/serverless'

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

export const saveRoute = async (createRoute: CreateRoute) => {
  const { name, places, image } = createRoute

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  await sql`INSERT INTO routes (user_id, name, places, image) values (${verified?.id}, ${name}, ${places}, ${image})`

  return 'ok'
}

export const deleteRoute = async (id: number) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  await sql`DELETE FROM routes WHERE id = ${id} AND user_id = ${verified.id}`

  return 'ok'
}

export const updateRoute = async ({
  id,
  name,
  places,
  image,
}: UpdateRoute) => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  if (typeof image === 'string') {
    await sql`UPDATE routes SET name = ${name}, places = ${places}, image = ${image} WHERE id = ${id} AND user_id = ${verified.id}`

    return 'ok'
  }

  await sql`UPDATE routes SET name = ${name}, places = ${places} WHERE id = ${id} AND user_id = ${verified.id}`

  return 'ok'
}

export const getMyRoutes = async () => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`SELECT * FROM routes WHERE user_id = ${verified.id}`

  return data.map((route) => ({
    ...(route as Route),
    places: normalizePlaces(route.places),
  })) as Route[]
}

export const getMyRouteById = async (id: number): Promise<Route | null> => {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  if (!verified) return null

  const sql = neon(`${process.env.DATABASE_URL}`)

  const data =
    await sql`SELECT * FROM routes WHERE id = ${id} AND user_id = ${verified.id} LIMIT 1`

  if (data.length === 0) return null

  const route = data[0] as Route

  return {
    ...route,
    places: normalizePlaces(route.places),
  }
}
