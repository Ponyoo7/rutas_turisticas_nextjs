import { FavoriteRoutes } from './components/FavoriteRoutes'
import { MyRoutes } from './components/MyRoutes'
import { ProfileHeader } from './components/ProfileHeader'

export default function Page() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <ProfileHeader />
        <MyRoutes />
        <FavoriteRoutes />
      </div>
    </main>
  )
}
