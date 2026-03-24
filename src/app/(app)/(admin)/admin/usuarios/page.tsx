import { getAdminUsers } from '@/actions/admin.actions'
import { AdminUsersDirectory } from './components/AdminUsersDirectory'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim() : ''
  const users = await getAdminUsers(query)

  return <AdminUsersDirectory initialUsers={users} initialQuery={query} />
}
