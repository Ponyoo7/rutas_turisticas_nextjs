import Image from "next/image"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

export interface Route {
    title: string;
    description: string;
    image: string;
}

interface Props {
    route: Route;
}

export const RouteCard = ({ route }: Props) => {
    return (
        <Card className="relative w-sm overflow-hidden py-0">
            <div className="flex flex-row h-32">
                <div className="relative w-1/3 min-w-[120px]">
                    <Image
                        src={route.image}
                        fill
                        alt={route.title}
                        className="object-cover"
                    />
                </div>

                <CardHeader className="flex-1 bg-white p-4 justify-center">
                    <CardTitle className="text-lg">{route.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{route.description}</CardDescription>
                </CardHeader>
            </div>
        </Card>
    )
}
