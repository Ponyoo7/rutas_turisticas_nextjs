import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

/**
 * Componente Hero principal usado en el "Home" de la aplicación.
 * Ofrece una vista visualmente atractiva con un Call To Action (CTA) primordial
 * hacia la página del buscador.
 */
export const MainImage = () => {
  return (
    <div className="p-0">
      <div className="relative flex min-h-[520px] flex-col items-start justify-end gap-6 overflow-hidden rounded-xl px-6 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn-imgix.headout.com/media/images/66bb4cc2e114ddd6d0d9f99037768beb-Pantheon%20Rome%20The%20Altar%20of%20the%20Holy%20Spirit.jpg"
          alt="Interior monumental de un edificio historico"
          className="absolute inset-0 h-full w-full object-cover object-[center_14%] brightness-[0.76] saturate-[0.82] md:object-[center_18%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,12,8,0.56)_0%,rgba(17,12,8,0.24)_42%,rgba(17,12,8,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.72)_100%)]" />

        <div className="flex flex-col gap-3 text-left z-10">
          <span className="text-white/80 uppercase tracking-widest text-xs font-bold">
            El arte de viajar
          </span>
          <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tight font-serif">
            Camina a través de la historia.
          </h1>
          <h2 className="text-white/90 text-base font-normal leading-relaxed max-w-[280px]">
            Descubre el alma de las ciudades a través de la mirada del arte y el
            tiempo.
          </h2>
        </div>
        <div className="flex flex-col w-full gap-3 mt-4 z-10 gap-y-3">
          <Button
            className="w-full h-14 bg-artis-primary text-white hover:bg-artis-primary/90 text-base font-bold shadow-lg border-none"
            asChild
          >
            <Link href="/buscador">Crear mi ruta cultural</Link>
          </Button>

          {/* <Button
            variant="outline"
            className="w-full h-14 bg-white/10 backdrop-blur-md border-white/30 text-white text-base font-bold hover:bg-white/20 hover:text-white border"
            asChild
          >
            <Link href="/rutas">Explore routes</Link>
          </Button> */}
        </div>
      </div>
    </div>
  )
}
