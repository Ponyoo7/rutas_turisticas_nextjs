import { User } from '@/shared/types/user'

export const AUTH_SYNC_STORAGE_KEY = 'routecraft.auth.sync'

type LoginAuthSyncPayload = {
  type: 'login'
  user: User
  at: number
}

type LogoutAuthSyncPayload = {
  type: 'logout'
  at: number
}

export type AuthSyncPayload = LoginAuthSyncPayload | LogoutAuthSyncPayload

const emitAuthSync = (payload: AuthSyncPayload) => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(AUTH_SYNC_STORAGE_KEY, JSON.stringify(payload))
}

export const emitLoginSync = (user: User) => {
  emitAuthSync({
    type: 'login',
    user,
    at: Date.now(),
  })
}

export const emitLogoutSync = () => {
  emitAuthSync({
    type: 'logout',
    at: Date.now(),
  })
}

export const parseAuthSyncPayload = (
  rawPayload: string | null,
): AuthSyncPayload | null => {
  if (!rawPayload) return null

  try {
    const parsed = JSON.parse(rawPayload) as Partial<AuthSyncPayload>

    if (parsed.type === 'logout') {
      return {
        type: 'logout',
        at: typeof parsed.at === 'number' ? parsed.at : Date.now(),
      }
    }

    if (
      parsed.type === 'login' &&
      typeof parsed.user === 'object' &&
      parsed.user !== null &&
      typeof parsed.user.id === 'string' &&
      typeof parsed.user.fullname === 'string' &&
      typeof parsed.user.email === 'string' &&
      typeof parsed.user.image === 'string' &&
      typeof parsed.user.role === 'string' &&
      typeof parsed.user.verified === 'boolean'
    ) {
      return {
        type: 'login',
        user: parsed.user,
        at: typeof parsed.at === 'number' ? parsed.at : Date.now(),
      }
    }

    return null
  } catch {
    return null
  }
}
