import { NextRequest, NextResponse } from 'next/server'
import {
  getFeaturedRoutesByCityPlaces,
  getMyFavoriteRouteIds,
} from '@/actions/routes.actions'
import { getInterestPlacesPayloadByCity } from '@/shared/services/interest-places.server'
import { CityVerifiedRoutesResponse } from '@/shared/types/interest-places'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const buildEmptyResponse = (city: string): CityVerifiedRoutesResponse => ({
  city,
  routes: [],
  favoriteRouteIds: [],
})

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city')?.trim() ?? ''

  if (!city) {
    return NextResponse.json(buildEmptyResponse(''))
  }

  try {
    const placesPayload = await getInterestPlacesPayloadByCity(city)

    if (placesPayload.places.length === 0) {
      return NextResponse.json(buildEmptyResponse(city))
    }

    const [routes, favoriteRouteIds] = await Promise.all([
      getFeaturedRoutesByCityPlaces(placesPayload.places),
      getMyFavoriteRouteIds(),
    ])
    const cityPlaceIds = new Set(placesPayload.places.map((place) => place.id))

    return NextResponse.json({
      city,
      routes: routes.map((route) => ({
        route,
        matchingPlacesCount: route.places.filter((place) =>
          cityPlaceIds.has(place.id),
        ).length,
      })),
      favoriteRouteIds,
    } satisfies CityVerifiedRoutesResponse)
  } catch {
    return NextResponse.json(buildEmptyResponse(city))
  }
}
