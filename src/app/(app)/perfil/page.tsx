import { ProfileHeader } from './components/ProfileHeader'
import { FavoriteRoutes } from './components/FavoriteRoutes'
import { MyRoutes } from './components/MyRoutes'

/**
 * Página principal del Perfil de usuario.
 * Compone el panel superior con sus datos (`ProfileHeader`) y el
 * listado de rutas creadas iterables (`MyRoutes`).
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <ProfileHeader />
        <MyRoutes />
        <FavoriteRoutes />
      </div>
    </main>
  )
}
