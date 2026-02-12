import { locationsService } from '@/shared/services/locations.service'
import { MapWrapper } from '../../../../shared/components/map/MapWrapper'
import { OSMElement } from '@/shared/types/locations'
import { AddToRouteMap } from './components/AddToRouteMap'

export default async function CrearRutaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const city = (await searchParams).city

  const res = await locationsService.getInterestPlacesByName(city as string)

  console.log(res)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Creador de Rutas</h1>
      {res && <AddToRouteMap {...res} />}
    </main>
  )
}
