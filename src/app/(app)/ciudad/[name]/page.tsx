import { locationsService } from "@/shared/services/locations.service"
import { Button } from "@/shared/components/ui/button"
import { MapWrapper } from "./components/MapWrapper"
import { RelevantPlaces } from "./components/RelevantPlaces"

export default async function CiudadPage({ params }: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params

    const res = await locationsService.getInterestPlacesByName(name)

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{name}</h1>
            {
                res && (
                    <>
                        <div className="flex flex-col gap-4">
                            <MapWrapper places={res.places} coords={res.coords} />
                            <Button className="">Crear ruta</Button>
                        </div>
                        <RelevantPlaces places={res.places} />
                    </>
                )
            }
        </div>
    )
}