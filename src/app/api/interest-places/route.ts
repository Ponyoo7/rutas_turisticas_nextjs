import { NextRequest, NextResponse } from 'next/server'
import { getInterestPlacesPayloadByCity } from '@/shared/services/interest-places.server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const API_S_MAXAGE_SECONDS = 60 * 60
const API_STALE_WHILE_REVALIDATE_SECONDS = 60 * 60 * 24 * 7

const buildCacheHeaders = () => ({
  'Cache-Control': `public, max-age=0, s-maxage=${API_S_MAXAGE_SECONDS}, stale-while-revalidate=${API_STALE_WHILE_REVALIDATE_SECONDS}`,
})

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city')?.trim() ?? ''

  if (!city) {
    return NextResponse.json(
      {
        city: '',
        coords: null,
        places: [],
        source: 'fallback',
      },
      {
        headers: buildCacheHeaders(),
      },
    )
  }

  try {
    const payload = await getInterestPlacesPayloadByCity(city)

    return NextResponse.json(payload, {
      headers: buildCacheHeaders(),
    })
  } catch {
    return NextResponse.json(
      {
        city,
        coords: null,
        places: [],
        source: 'fallback',
      },
      {
        headers: buildCacheHeaders(),
      },
    )
  }
}
