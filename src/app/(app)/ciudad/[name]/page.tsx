import { Suspense } from 'react'
import { CityHeader } from './components/CityHeader'
import { CityExplorerSkeleton } from './components/CityExplorerSkeleton'
import { CityHeaderSkeleton } from './components/CityHeaderSkeleton'
import { CityMapSection } from './components/CityMapSection'

export default async function CiudadPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4">
      <Suspense fallback={<CityHeaderSkeleton name={decodedName} />}>
        <CityHeader name={decodedName} />
      </Suspense>

      <div className="z-20 flex w-full flex-col gap-6">
        <Suspense fallback={<CityExplorerSkeleton />}>
          <CityMapSection cityName={decodedName} />
        </Suspense>
      </div>
    </div>
  )
}
