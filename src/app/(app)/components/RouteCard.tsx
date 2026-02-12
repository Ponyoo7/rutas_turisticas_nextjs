import Image from 'next/image'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Route } from '@/shared/types/routes'

interface Props {
  route: Route
}

export const RouteCard = ({ route }: Props) => {
  return (
    <Card className="relative w-sm overflow-hidden py-0">
      <div className="flex flex-row h-32">
        <div className="relative w-1/3 min-w-30">
          <Image
            src={route.image}
            fill
            alt={route.name}
            className="object-cover"
          />
        </div>
        <CardHeader className="flex-1 bg-white p-4 justify-center">
          <CardTitle className="text-lg">{route.name}</CardTitle>
        </CardHeader>
      </div>
    </Card>
  )
}
