import { CityExplorerSkeleton } from './components/CityExplorerSkeleton'
import { CityHeaderSkeleton } from './components/CityHeaderSkeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-4">
      <CityHeaderSkeleton name="Cargando ciudad" />
      <CityExplorerSkeleton />
    </div>
  )
}
