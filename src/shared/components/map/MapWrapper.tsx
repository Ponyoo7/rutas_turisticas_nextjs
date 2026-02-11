'use client'

import dynamic from "next/dynamic";
import { MapSearch } from "../../../app/(app)/ciudad/[name]/components/MapSearch";
import { useMapSearch } from "./hooks/useMapSearch";
import { OSMElement } from "@/shared/types/locations";

const MapNoSSR = dynamic(() => import("@/shared/components/map/Map"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse" />
});

interface Props {
    places: OSMElement[]
    coords: number[]
    onClick?: (place: OSMElement) => void
    routePlaces?: OSMElement[]
}

export const MapWrapper = ({ places, coords, onClick, routePlaces }: Props) => {
    const {
        search,
        setSearch,
        flyTo,
        setFlyTo,
        filteredPlaces,
        handleSelectPlace
    } = useMapSearch(places);

    return (
        <div className="relative mt-4">
            <MapSearch
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setFlyTo(null);
                }}
                filteredPlaces={filteredPlaces}
                onSelectPlace={handleSelectPlace}
            />

            <MapNoSSR places={places} zoom={15} coords={coords} flyTo={flyTo} onClick={onClick} routePlaces={routePlaces} />
        </div>
    )
}