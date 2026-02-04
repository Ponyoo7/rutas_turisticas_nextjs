import { locationsService } from "@/shared/services/locations.service"
import { OSMElement } from "@/shared/types/locations"

interface Props {
    place: OSMElement
}

export const PlaceCard = async ({ place }: Props) => {
    const res = await locationsService.getWikiInfo(place.tags.wikipedia)

    console.log(res)

    return (
        <div className="flex flex-row">
            <img src={res?.thumbnail?.source} />
            <div>
                <p>{res?.title}</p>
                <p>{res?.extract}</p>
            </div>
        </div>
    )
}