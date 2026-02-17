import { OSMElement } from '@/shared/types/locations'
import { PlaceCard } from './PlaceCard'

interface Props {
  places: OSMElement[]
}

export const RelevantPlaces = ({ places }: Props) => {
  const random = places
    .filter((e) => e.tags.tourism !== 'museum' && e.tags.website)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
          Sitios interesantes
        </h2>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {random.map((r) => (
          <PlaceCard key={r.id} place={r} />
        ))}
      </div>
    </div>
  )
}
