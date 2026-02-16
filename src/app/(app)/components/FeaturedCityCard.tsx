import Link from 'next/link'
import { WikiData } from '@/shared/types/locations'

interface Props {
  city: WikiData
}

export const FeaturedCityCard = ({ city }: Props) => {
  return (
    <Link
      href={`/ciudad/${city.title}`}
      className="flex flex-col gap-3 shrink-0 w-64 group"
    >
      <div
        className="relative w-full aspect-4/5 bg-cover bg-center rounded-xl shadow-md overflow-hidden"
        style={{
          backgroundImage: `url("${city.thumbnail?.source ?? '/museo_placeholder.jpg'}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
        {/* <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-artis-primary">
            City
          </span>
        </div> */}
      </div>
      <div className="px-1">
        <p className="text-artis-primary dark:text-gray-100 text-lg font-bold font-serif">
          {city.title}
        </p>
        <p className="text-gray-500 text-sm font-medium line-clamp-1">
          {city.extract}
        </p>
      </div>
    </Link>
  )
}
