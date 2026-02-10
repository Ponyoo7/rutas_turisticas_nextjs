'use server'

import { User, UserCredentials, UserRegister } from "@/shared/types/user"
import { neon } from "@neondatabase/serverless"
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

export const createUser = async (user: UserRegister) => {
    const { fullname, password, email } = user

    const sql = neon(`${process.env.DATABASE_URL}`)

    const encryptedPassword = bcrypt.hashSync(password, 10)

    await sql`INSERT INTO users (fullname, email, password) values (${fullname}, ${email}, ${encryptedPassword})`

    return {
        success: true
    }
}

export const login = async (credentials: UserCredentials) => {
    const cookieStore = await cookies()

    const { email, password } = credentials

    const sql = neon(`${process.env.DATABASE_URL}`)

    const data = await sql`SELECT * FROM users WHERE email = ${email}`

    if (data.length === 0) throw Error('USER_NOT_FOUND')

    const user = data[0]

    if (!bcrypt.compareSync(password, user.password)) throw Error('WRONG_CREDENTIALS')

    const userData = {
        id: user.id,
        email,
        fullname: user.fullname
    }

    const token = jwt.sign(userData, process.env.JWT_SECRET!)

    cookieStore.set({
        name: 'auth',
        value: token,
        httpOnly: true,
        path: '/'
    })

    return userData
}

export const verifyToken = async (token: string | undefined): Promise<User | undefined | null> => {
    if (!token) return null

    return jwt.verify(token, process.env.JWT_SECRET!) as User
}