import { locationsService } from "@/shared/services/locations.service"
import { OSMElement } from "@/shared/types/locations"
import { ExpandableText } from "./ExpandableText"

interface Props {
    place: OSMElement
}

export const PlaceCard = async ({ place }: Props) => {
    const res = await locationsService.getWikiInfo(place.tags.wikipedia)

    return (
        <div className="flex flex-row">
            <img src={res?.thumbnail?.source} />
            <div>
                <p>{res?.title}</p>
                <ExpandableText text={res?.extract || ''} limit={200} />
            </div>
        </div>
    )
}