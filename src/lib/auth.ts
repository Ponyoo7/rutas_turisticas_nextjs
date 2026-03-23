import { User } from '@/shared/types/user'

type AuthUser = Pick<User, 'role' | 'verified'> | null | undefined

export const isMaster = (user: AuthUser) => user?.role === 'master'

export const isAdmin = (user: AuthUser) =>
  user?.role === 'admin' || isMaster(user)

export const canAccessAdmin = (user: AuthUser) =>
  Boolean(user?.verified && isAdmin(user))
