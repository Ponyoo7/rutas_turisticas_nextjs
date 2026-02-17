import Link from 'next/link'
import { Route } from '@/shared/types/routes'
import { Button } from '@/shared/components/ui/button'

interface RouteDetailHeaderProps {
  route: Route
}

export const RouteDetailHeader = ({ route }: RouteDetailHeaderProps) => {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="text-sm text-slate-500">Detalle de ruta</p>
        <h1 className="text-3xl font-bold text-slate-900">{route.name}</h1>
      </div>

      <Button
        asChild
        className="bg-white text-artis-primary hover:bg-gray-100 font-bold shadow-lg border border-artis-primary"
      >
        <Link href="/rutas">Volver a rutas</Link>
      </Button>
    </header>
  )
}
