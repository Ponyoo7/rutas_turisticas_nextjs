import Image from "next/image"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface Props {
    city: { name: string }
}

export const FeaturedCityCard = ({ city }: Props) => {
    return (
        <Card className="relative w-64 pt-0">
            <div className="relative h-52">
                <Image
                    src='/museo_placeholder.jpg'
                    fill
                    alt="museo placeholder"
                    className="rounded-t-xl object-cover"
                />

            </div>
            <CardHeader className="z-3 bg-white ">
                <CardTitle>{city.name}</CardTitle>
                <CardDescription>ajsbdhsbd</CardDescription>
            </CardHeader>
        </Card>
    )
}