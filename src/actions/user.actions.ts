'use server'

import { User, UserCredentials, UserRegister } from '@/shared/types/user'
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

    const data = await sql`SELECT * FROM users WHERE email = ${email}`

    if (data.length === 0) {
      return {
        ok: false,
        error: INVALID_CREDENTIALS_ERROR,
      }
    }

    const user = data[0]

    if (!bcrypt.compareSync(password, user.password)) {
      return {
        ok: false,
        error: INVALID_CREDENTIALS_ERROR,
      }
    }

    const userData: User = {
      id: user.id,
      email,
      fullname: user.fullname,
      image: user.image,
    }

    const token = jwt.sign(userData, process.env.JWT_SECRET!)

    cookieStore.set({
      name: 'auth',
      value: token,
      httpOnly: true,
      path: '/',
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
    return jwt.verify(token, process.env.JWT_SECRET!) as User
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
