import { locationsService } from "@/shared/services/locations.service"
import { MapWrapper } from "./components/MapWrapper"
import { RelevantPlances } from "./components/RelevantPlaces"

export default async function CiudadPage({ params }: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params

    const res = await locationsService.getInterestPlacesByName(name)

    return (
        <div>
            <h1 >{name}</h1>
            {
                res && (
                    <>
                        <MapWrapper places={res.places} coords={res.coords} />
                        <RelevantPlances places={res.places} />
                    </>
                )
            }
        </div>
    )
}