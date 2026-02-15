import { OSMElement } from '@/shared/types/locations'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { getPlaceTypeLabel } from '@/lib/utils'

interface RoutePlacesListProps {
  places: OSMElement[]
}

export const RoutePlacesList = ({ places }: RoutePlacesListProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Paradas de la ruta</h2>

      {places.length === 0 && (
        <p className="text-sm text-slate-500">No hay lugares guardados para esta ruta.</p>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {places.map((place, index) => (
          <Card key={`${place.type}-${place.id}-${index}`} className="gap-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">
                {index + 1}. {place.tags.name ?? 'Punto sin nombre'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              {getPlaceTypeLabel(place)}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

