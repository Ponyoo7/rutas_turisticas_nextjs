'use server'

import { CreateRoute } from "@/shared/types/routes";
import { cookies } from "next/headers";
import { verifyToken } from "./user.actions";
import { neon } from "@neondatabase/serverless";

export const saveRoute = async (createRoute: CreateRoute) => {
    const { name, places } = createRoute

    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth')

    const verified = await verifyToken(authToken?.value)

    if (!verified) return

    const sql = neon(`${process.env.DATABASE_URL}`)

    await sql`INSERT INTO routes (user_id, name, places) values (${verified?.id}, ${name}, ${places})`

    return 'ok'
}