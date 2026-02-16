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

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Creador de Rutas</h1>
        <p className="text-gray-500">
          Diseña tu propia aventura cultural añadiendo sitios al mapa.
        </p>
      </header>

      {res && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <AddToRouteMap {...res} />
        </div>
      )}
    </main>
  )
}
