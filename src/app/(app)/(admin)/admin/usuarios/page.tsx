import { getAdminUsers } from '@/actions/admin.actions'
import { AdminEmptyState } from '../components/AdminEmptyState'

const roleStyles = {
  master: 'bg-artis-primary text-white',
  admin: 'bg-[#d7c2aa] text-artis-primary',
  user: 'bg-[#f6efe6] text-gray-700',
}

export default async function Page() {
  const users = await getAdminUsers()

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
              Usuarios
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-artis-primary">
              Directorio de usuarios
            </h2>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {users.length} usuarios
          </span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
          Primera vista de solo lectura para revisar identidad, email, rol y
          estado de verificación sin introducir todavía acciones de gestión.
        </p>
      </div>

      {users.length === 0 ? (
        <AdminEmptyState
          title="No hay usuarios para mostrar"
          description="Cuando existan registros en la base de datos, aparecerán aquí con su rol y estado de verificación."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-serif text-2xl font-bold text-artis-primary">
                    {user.fullname}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{user.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${roleStyles[user.role]}`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                      user.verified
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {user.verified ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
