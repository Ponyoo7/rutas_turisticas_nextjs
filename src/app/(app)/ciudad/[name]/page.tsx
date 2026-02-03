import { Map } from "@/shared/components/map/Map"

export default async function CiudadPage({ params }: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params

    console.log(name)

    return (
        <div>

            <Map center={[41.8902, 12.4922]} zoom={15} />
        </div>
    )
}