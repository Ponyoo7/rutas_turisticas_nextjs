import Image from "next/image"
import { FeaturedCityCard } from "./FeaturedCityCard"
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel"

const placeholderCities = [
    {
        name: 'Roma'
    },
    {
        name: 'Madrid'
    },
    {
        name: 'Paris'
    },
    {
        name: 'Roma'
    },
    {
        name: 'Madrid'
    },
    {
        name: 'Paris'
    },
    {
        name: 'Roma'
    },
    {
        name: 'Madrid'
    },
    {
        name: 'Paris'
    }
]

export const FeaturedCities = () => {
    return (
        <div>
            <h2>Ciudades populares</h2>

            <Carousel className="w-full">
                <CarouselContent>
                    {
                        placeholderCities.map((c, i) => (
                            <CarouselItem key={i} className="basis-1/4.5">
                                <FeaturedCityCard city={c} />
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
            </Carousel>
        </div >
    )
}