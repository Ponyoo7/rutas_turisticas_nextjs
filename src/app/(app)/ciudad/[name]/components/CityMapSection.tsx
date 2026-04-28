import { getCityMapSeed } from '@/shared/services/interest-places.server'
import { CityMapClient } from './CityMapClient'

interface Props {
  cityName: string
}

export const CityMapSection = async ({ cityName }: Props) => {
  const seed = await getCityMapSeed(cityName)

  return (
    <CityMapClient
      cityName={cityName}
      initialCoords={seed.coords}
      initialPlaces={seed.places}
      initialSource={seed.source}
      initialStale={seed.stale}
    />
  )
}
