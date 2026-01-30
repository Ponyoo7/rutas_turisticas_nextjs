import Image from "next/image";
import { MainImage } from "./components/MainImage";
import { FeaturedCities } from "./components/FeaturedCities";
import { MyRoutes } from "./components/MyRoutes";


export default function HomePage() {
    return (
        <main className="w-full h-full">
            <MainImage />
            <FeaturedCities />
            <MyRoutes />
        </main>
    );
}
