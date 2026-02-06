'use server'

import { neon } from "@neondatabase/serverless"
import * as bcrypt from 'bcrypt'

export const createUser = async (user: any) => {
    const { fullname, password, email } = user

    const sql = neon(`${process.env.DATABASE_URL}`)

    console.log(user)

    const encryptedPassword = bcrypt.hashSync(password, 10)

    await sql`INSERT INTO users (fullname, email, password) values (${fullname}, ${email}, ${encryptedPassword})`
}
