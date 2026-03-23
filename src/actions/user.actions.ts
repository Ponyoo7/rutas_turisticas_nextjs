'use server'

import { User, UserCredentials, UserRegister, UserRole } from '@/shared/types/user'
import { neon } from '@neondatabase/serverless'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

type LoginResult =
  | {
      ok: true
      user: User
    }
  | {
      ok: false
      error: string
    }

type CreateUserResult =
  | {
      ok: true
    }
  | {
      ok: false
      error: string
    }

type DbUserRow = {
  id: string | number
  fullname: string
  email: string
  image: string
  password?: string
  role?: unknown
  verified?: unknown
}

type LegacyJwtUser = {
  id?: string | number
  fullname?: string
  email?: string
  image?: string
  role?: unknown
  verified?: unknown
}

type CompleteJwtUser = {
  id: string | number
  fullname: string
  email: string
  image: string
  role: unknown
  verified: boolean
}

const INVALID_CREDENTIALS_ERROR = 'Email o contraseña incorrectos'
const LOGIN_GENERIC_ERROR = 'No se pudo iniciar sesión. Inténtalo de nuevo.'
const EMAIL_ALREADY_REGISTERED_ERROR = 'Ya existe una cuenta con ese email'
const REGISTER_GENERIC_ERROR = 'No se pudo crear la cuenta. Inténtalo de nuevo.'

const isPgErrorWithCode = (error: unknown, code: string) => {
  if (typeof error !== 'object' || error === null) return false
  if (!('code' in error)) return false
  return error.code === code
}

const validatePassword = (password: string) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (password.length < minLength)
    return 'La contraseña debe tener al menos 8 caracteres'
  if (!hasUpperCase)
    return 'La contraseña debe tener al menos una letra mayúscula'
  if (!hasNumber) return 'La contraseña debe tener al menos un número'

  return null
}

const normalizeRole = (role: unknown): UserRole => {
  if (role === 'admin' || role === 'master') return role

  return 'user'
}

const normalizeVerified = (verified: unknown) => verified === true

const hasCompleteUserShape = (
  payload: LegacyJwtUser,
): payload is CompleteJwtUser =>
  payload.id != null &&
  typeof payload.fullname === 'string' &&
  typeof payload.email === 'string' &&
  typeof payload.image === 'string' &&
  typeof payload.role === 'string' &&
  typeof payload.verified === 'boolean'

const mapDbUserToUser = (user: DbUserRow): User => ({
  id: String(user.id),
  fullname: user.fullname,
  email: user.email,
  image: user.image,
  role: normalizeRole(user.role),
  verified: normalizeVerified(user.verified),
})

const getUserById = async (id: string): Promise<User | null> => {
  const sql = neon(`${process.env.DATABASE_URL}`)

  const data = await sql`
    SELECT id, fullname, email, image, role, verified
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `

  if (data.length === 0) return null

  return mapDbUserToUser(data[0] as DbUserRow)
}

export const createUser = async (
  user: UserRegister,
): Promise<CreateUserResult> => {
  const { fullname, password, email, image } = user

  const passwordError = validatePassword(password)
  if (passwordError) {
    return {
      ok: false,
      error: passwordError,
    }
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`)

    const encryptedPassword = bcrypt.hashSync(password, 10)

    await sql`INSERT INTO users (fullname, email, password, image) values (${fullname}, ${email}, ${encryptedPassword}, ${image})`

    return {
      ok: true,
    }
  } catch (error) {
    if (isPgErrorWithCode(error, '23505')) {
      return {
        ok: false,
        error: EMAIL_ALREADY_REGISTERED_ERROR,
      }
    }

    return {
      ok: false,
      error: REGISTER_GENERIC_ERROR,
    }
  }
}

export const login = async (
  credentials: UserCredentials,
): Promise<LoginResult> => {
  try {
    const cookieStore = await cookies()

    const { email, password } = credentials

    const sql = neon(`${process.env.DATABASE_URL}`)

    const data = await sql`
      SELECT id, fullname, email, image, password, role, verified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    if (data.length === 0) {
      return {
        ok: false,
        error: INVALID_CREDENTIALS_ERROR,
      }
    }

    const user = data[0] as DbUserRow

    if (!user.password || !bcrypt.compareSync(password, user.password)) {
      return {
        ok: false,
        error: INVALID_CREDENTIALS_ERROR,
      }
    }

    const userData = mapDbUserToUser(user)

    const token = jwt.sign(userData, process.env.JWT_SECRET!)

    cookieStore.set({
      name: 'auth',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return {
      ok: true,
      user: userData,
    }
  } catch {
    return {
      ok: false,
      error: LOGIN_GENERIC_ERROR,
    }
  }
}

export const verifyToken = async (
  token: string | undefined,
): Promise<User | undefined | null> => {
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)

    if (typeof decoded !== 'object' || decoded === null) return null

    const payload = decoded as LegacyJwtUser

    if (payload.id == null) return null

    if (hasCompleteUserShape(payload)) {
      return {
        id: String(payload.id),
        fullname: payload.fullname,
        email: payload.email,
        image: payload.image,
        role: normalizeRole(payload.role),
        verified: normalizeVerified(payload.verified),
      }
    }

    return await getUserById(String(payload.id))
  } catch {
    return null
  }
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('auth')

  return {
    success: true,
  }
}
