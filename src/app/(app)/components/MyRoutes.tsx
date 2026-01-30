import Image from "next/image"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

export const MyRoutes = () => {
    return (
        <div>
            <h2>Mis rutas</h2>

            <Card className="relative w-sm overflow-hidden py-0">
                <div className="flex flex-row h-32">
                    <div className="relative w-1/3 min-w-[120px]">
                        <Image
                            src='/museo_placeholder.jpg'
                            fill
                            alt="museo placeholder"
                            className="object-cover"
                        />
                    </div>

                    <CardHeader className="flex-1 bg-white p-4 justify-center">
                        <CardTitle className="text-lg">prueba</CardTitle>
                        <CardDescription className="line-clamp-2">ajsbdhsbd</CardDescription>
                    </CardHeader>
                </div>
            </Card>

        </div>
    )
}