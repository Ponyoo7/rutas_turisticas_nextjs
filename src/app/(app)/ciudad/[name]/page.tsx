import { getInterestPlacesByNameCached } from '@/shared/services/locations.cached.server'
import { MapWrapper } from '../../../../shared/components/map/MapWrapper'
import { RelevantPlaces } from './components/RelevantPlaces'
import { CityHeader } from './components/CityHeader'

export default async function CiudadPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params

  const decodedName = decodeURIComponent(name)
  const res = await getInterestPlacesByNameCached(decodedName)

  return (
    <div className="flex flex-col gap-6 min-h-screenp p-4">
      <CityHeader places={res?.places ?? []} name={decodedName} />
      <div className="flex flex-col gap-6 w-full z-20">
        {res && (
          <div className="grid grid-cols-1">
            <div className="lg:col-span-8 flex flex-col gap-4 px-4 pb-4 ">
              <div className="bg-white overflow-hidden relative">
                <MapWrapper places={res.places} coords={res.coords} />
              </div>
              <RelevantPlaces places={res.places} />
            </div>
            {/* Sidebar/Extra content could go here in lg:col-span-4 */}
          </div>
        )}
      </div>
    </div>
  )
}
