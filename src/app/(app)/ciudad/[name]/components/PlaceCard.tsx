'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { locationsService } from '@/shared/services/locations.service'
import { OSMElement, WikiData } from '@/shared/types/locations'
import { ExpandableText } from './ExpandableText'

interface Props {
  place: OSMElement
}

export const PlaceCard = ({ place }: Props) => {
  const wikiTag = place.tags.wikipedia
  const [wikiState, setWikiState] = useState<{
    data: WikiData | null
    wikiTag: string | null
  }>({
    data: null,
    wikiTag: null,
  })

  useEffect(() => {
    let isActive = true

    if (!wikiTag) {
      return () => {
        isActive = false
      }
    }

    locationsService
      .getWikiInfo(wikiTag)
      .then((result) => {
        if (!isActive) return

        setWikiState({
          data: result,
          wikiTag,
        })
      })
      .catch(() => {
        if (!isActive) return

        setWikiState({
          data: null,
          wikiTag,
        })
      })

    return () => {
      isActive = false
    }
  }, [wikiTag])

  const placeInfo = wikiState.wikiTag === wikiTag ? wikiState.data : null
  const isLoading = Boolean(wikiTag) && wikiState.wikiTag !== wikiTag

  const imageUrl =
    locationsService.getPlaceImage(place, placeInfo) || '/museo_placeholder.jpg'
  const description =
    placeInfo?.extract || place.tags.description || 'Sin descripcion disponible.'

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url("${imageUrl}")`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60"></div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-serif text-lg font-bold leading-tight text-shadow-sm">
            {placeInfo?.title || place.tags.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 text-sm leading-relaxed text-gray-600">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
            </div>
          ) : (
            <ExpandableText text={description} limit={50} />
          )}
        </div>

        {place.tags.website && (
          <Link
            href={place.tags.website}
            target="_blank"
            className="mt-auto pt-2 text-xs font-bold uppercase tracking-wider text-artis-primary hover:underline"
          >
            Visitar web
          </Link>
        )}
      </div>
    </div>
  )
}
