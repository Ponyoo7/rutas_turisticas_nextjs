import { locationsService } from '@/shared/services/locations.service'
import { Button } from '@/shared/components/ui/button'
import { MapWrapper } from '../../../../shared/components/map/MapWrapper'
import { RelevantPlaces } from './components/RelevantPlaces'
import Link from 'next/link'

export default async function CiudadPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params

  const decodedName = decodeURIComponent(name)
  const res = await locationsService.getInterestPlacesByName(decodedName)

  console.log(res)

  // Try to find a good image for the hero from the places/wiki
  const placesWithImages =
    res?.places.filter((p) => p.tags.image || p.tags.wikipedia) || []
  const heroImage =
    placesWithImages.length > 0
      ? (await locationsService.getWikiInfo(placesWithImages[0].tags.wikipedia))
          ?.thumbnail?.source
      : null

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 pb-12 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("${heroImage || '/museo_placeholder.jpg'}")`,
        }}
      >
        <div className="flex flex-col gap-2 z-10 max-w-3xl">
          <h1 className="text-white text-5xl md:text-6xl font-black leading-[1.1] tracking-tight font-serif capitalize drop-shadow-lg">
            {decodedName}
          </h1>
          <p className="text-white/90 text-lg font-medium max-w-xl mx-auto drop-shadow-md">
            Discover the hidden gems and cultural landmarks of {decodedName}.
          </p>
        </div>

        <div className="z-10 mt-6">
          {res && (
            <Button
              className="bg-artis-primary hover:bg-artis-primary/90 text-white font-bold px-8 py-6 text-lg shadow-xl"
              asChild
            >
              <Link href={`/rutas/crear?city=${name}`}>
                Crear ruta personalizada
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full z-20">
        {res && (
          <div className="grid grid-cols-1">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="bg-white p-1 rounded-2xl shadow-xl overflow-hidden aspect-video relative border-4 border-white">
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
