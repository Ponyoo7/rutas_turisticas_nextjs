import { verifyToken } from '@/actions/user.actions'
import { canAccessAdmin } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const user = await verifyToken(authToken?.value)

  if (!user) redirect('/login')
  if (!canAccessAdmin(user)) redirect('/')

  return <>{children}</>
}
