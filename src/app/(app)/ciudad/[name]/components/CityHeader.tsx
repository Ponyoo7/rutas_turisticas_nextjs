import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { locationsService } from '@/shared/services/locations.service'

interface Props {
  name: string
}

const shouldUseNativeHeroImg = (src: string) =>
  src.startsWith('/api/wiki-image') ||
  src.includes('?') ||
  /^https?:\/\//i.test(src)

export const CityHeader = async ({ name }: Props) => {
  const cityInfo =
    (await locationsService.getWikiInfoByTitle(name, 'es')) ??
    (await locationsService.getWikiInfoByTitle(name, 'en'))
  const heroImage =
    cityInfo?.heroImage?.source ??
    cityInfo?.thumbnail?.source ??
    '/museo_placeholder.jpg'
  const heroTitle = cityInfo?.title || name
  const imageSrc =
    locationsService.toRenderableImageUrl(heroImage) || '/museo_placeholder.jpg'
  const useNativeHeroImg = shouldUseNativeHeroImg(imageSrc)

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-xl">
      {useNativeHeroImg ? (
        // Dynamic proxied hero images can carry query strings that Next/Image may reject.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={`Vista principal de ${heroTitle}`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <Image
          src={imageSrc}
          alt={`Vista principal de ${heroTitle}`}
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />

      <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-8 px-6 pb-12 text-center">
        <div className="z-10 flex max-w-3xl flex-col gap-2">
          <h1 className="font-serif text-5xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg capitalize md:text-6xl">
            {heroTitle}
          </h1>
        </div>

        <div className="z-10 mt-4">
          <Button
            className="border-none bg-artis-primary px-8 py-6 text-lg font-bold text-white shadow-lg hover:bg-artis-primary/90"
            asChild
          >
            <Link href={`/rutas/crear?city=${name}`}>Crear ruta personalizada</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
