import { Button } from "@/shared/components/ui/button";
import Image from "next/image";


export const MainImage = () => {
    return (
        <div className="relative w-full h-[300px]">
            <Image
                src='/cupula.jpg'
                alt="Cúpula de la iglesia"
                fill
                className="object-cover grayscale-20 brightness-80"
            />

            <div className="w-full h-full absolute z-1 flex flex-col justify-end gap-8 p-8">
                <div>
                    <p className="text-white">asjdbabsd</p>
                    <h2>ahsdvhasd</h2>
                    <p>ajshdvsagvhd</p>
                </div>
                <div className="self-center">
                    <Button className="min-w-[350px]">Crear una ruta cultural</Button>
                </div>
            </div>

        </div>
    )
}