import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement } from '@/shared/types/locations'
import Link from 'next/link'

interface Props {
  places: OSMElement[]
  name: string
}

export const CityHeader = async ({ places, name }: Props) => {
  const placesWithImages =
    places.filter((p) => p.tags.image || p.tags.wikipedia) || []
  const heroImage =
    placesWithImages.length > 0
      ? (await locationsService.getWikiInfo(placesWithImages[0].tags.wikipedia))
          ?.thumbnail?.source
      : null

  return (
    <div
      className="relative flex min-h-[300px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 pb-12 text-center rounded-xl"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("${heroImage || '/museo_placeholder.jpg'}")`,
      }}
    >
      <div className="flex flex-col gap-2 z-10 max-w-3xl">
        <h1 className="text-white text-5xl md:text-6xl font-black leading-[1.1] tracking-tight font-serif capitalize drop-shadow-lg">
          {name}
        </h1>
        <p className="text-white/90 text-lg font-medium max-w-xl mx-auto drop-shadow-md">
          Descubre las joyas ocultas y los hitos culturales de {name}.
        </p>
      </div>

      <div className="z-10 mt-6">
        {name && (
          <Button
            className="bg-artis-primary text-white hover:bg-artis-primary/90 font-bold px-8 py-6 text-lg shadow-lg border-none"
            asChild
          >
            <Link href={`/rutas/crear?city=${name}`}>
              Crear ruta personalizada
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
