import { locationsService } from '@/shared/services/locations.service'
import { OSMElement } from '@/shared/types/locations'
import { ExpandableText } from './ExpandableText'
import Link from 'next/link'

interface Props {
  place: OSMElement
}

export const PlaceCard = async ({ place }: Props) => {
  const res = await locationsService.getWikiInfo(place.tags.wikipedia)

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group h-full">
      <div className="relative h-48 w-full overflow-hidden">
        {/* Placeholder or image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url("${res?.thumbnail?.source || '/museo_placeholder.jpg'}")`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold font-serif leading-tight text-shadow-sm">
            {res?.title || place.tags.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="text-gray-600 text-sm leading-relaxed flex-1">
          <ExpandableText
            text={res?.extract || 'No description available.'}
            limit={50}
          />
        </div>

        {place.tags.website && (
          <Link
            href={place.tags.website}
            target="_blank"
            className="text-artis-primary text-xs font-bold uppercase tracking-wider hover:underline mt-auto pt-2"
          >
            Visit Website
          </Link>
        )}
      </div>
    </div>
  )
}
