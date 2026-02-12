'use server'

import { User, UserCredentials, UserRegister } from "@/shared/types/user"
import { neon } from "@neondatabase/serverless"
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (password.length < minLength) return "La contraseña debe tener al menos 8 caracteres"
    if (!hasUpperCase) return "La contraseña debe tener al menos una letra mayúscula"
    if (!hasNumber) return "La contraseña debe tener al menos un número"

    return null
}

export const createUser = async (user: UserRegister) => {
    const { fullname, password, email } = user

    const passwordError = validatePassword(password)
    if (passwordError) throw Error(passwordError)

    const sql = neon(`${process.env.DATABASE_URL}`)

    const encryptedPassword = bcrypt.hashSync(password, 10)

    await sql`INSERT INTO users (fullname, email, password) values (${fullname}, ${email}, ${encryptedPassword})`

    return {
        success: true
    }
}

export const login = async (credentials: UserCredentials) => {
    try {
        const cookieStore = await cookies()

        const { email, password } = credentials

        const sql = neon(`${process.env.DATABASE_URL}`)

        const data = await sql`SELECT * FROM users WHERE email = ${email}`

        if (data.length === 0) throw Error('INVALID_CREDENTIALS')

        const user = data[0]

        if (!bcrypt.compareSync(password, user.password)) throw Error('INVALID_CREDENTIALS')

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
    } catch (error) {
        throw Error('Email o contraseña incorrectos')
    }
}

export const verifyToken = async (token: string | undefined): Promise<User | undefined | null> => {
    if (!token) return null

    return jwt.verify(token, process.env.JWT_SECRET!) as User
}