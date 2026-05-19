import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

interface Props {
  name: string
}

const CITY_HEADER_IMAGE = '/cupula.jpg'

export const CityHeader = ({ name }: Props) => {
  return (
    <div
      className="relative flex min-h-[300px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 pb-12 text-center rounded-xl"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("${CITY_HEADER_IMAGE}")`,
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
