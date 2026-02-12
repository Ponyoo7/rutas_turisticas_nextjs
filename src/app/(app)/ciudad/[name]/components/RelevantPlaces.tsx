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
    <div>
      {random.map((r) => (
        <PlaceCard key={r.id} place={r} />
      ))}
    </div>
  )
}
