import Image from 'next/image'
import { MainImage } from './components/MainImage'
import { FeaturedCities } from './components/FeaturedCities'
import { MyRoutes } from './components/MyRoutes'

export default function HomePage() {
  return (
    <main className="w-full h-full p-4">
      <MainImage />
      <div className="flex flex-col gap-4">
        <FeaturedCities />
        <MyRoutes />
      </div>
    </main>
  )
}
