import { OSMElement } from "@/shared/types/locations"
import { PlaceCard } from "./PlaceCard"

interface Props {
    places: OSMElement[]
}

export const RelevantPlances = ({ places }: Props) => {
    const random = places.filter(e => e.tags.name && e.tags.wikipedia && e.tags.tourism && e.tags.website).sort(() => 0.5 - Math.random()).slice(0, 6)

    console.log(random)

    return (
        <div>
            {
                random.map(r => (
                    <PlaceCard key={r.id} place={r} />
                ))
            }
        </div>

    )
}