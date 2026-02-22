import { ProfileHeader } from './components/ProfileHeader'
import { MyRoutes } from './components/MyRoutes'

export default function Page() {
  return (
    <main className="min-h-screen dark:bg-artis-background-dark p-6 md:p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <ProfileHeader />
        <MyRoutes />
      </div>
    </main>
  )
}
