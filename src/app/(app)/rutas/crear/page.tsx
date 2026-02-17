import { locationsService } from '@/shared/services/locations.service'
import { AddToRouteMap } from './components/AddToRouteMap'

export default async function CrearRutaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const city = (await searchParams).city

  const res = await locationsService.getInterestPlacesByName(city as string)
  const placesWithImages =
    res?.places.filter((p) => p.tags.image || p.tags.wikipedia) || []
  const heroImage =
    placesWithImages.length > 0
      ? (await locationsService.getWikiInfo(placesWithImages[0].tags.wikipedia))
          ?.thumbnail?.source
      : null
  return (
    <main className="w-full h-full p-4">
      <div>
        <div
          className="relative flex min-h-[300px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 pb-12 rounded-xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("${heroImage || '/museo_placeholder.jpg'}")`,
          }}
        >
          <div className="flex flex-col gap-3 text-left z-10">
            <span className="text-white/80 uppercase tracking-widest text-xs font-bold">
              Diseña tu aventura
            </span>
            <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tight font-serif">
              Creador de Rutas
            </h1>
            <h2 className="text-white/90 text-base font-normal leading-relaxed max-w-[400px]">
              Selecciona los mejores lugares y crea una experiencia inolvidable.
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {res && <AddToRouteMap {...res} />}
      </div>
    </main>
  )
}
