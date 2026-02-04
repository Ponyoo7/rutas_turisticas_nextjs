'use client'

import dynamic from "next/dynamic";

const MapNoSSR = dynamic(() => import("@/shared/components/map/Map"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-gray-100 animate-pulse" />
});

interface Props {
    places: any[]
    coords: number[]
}

export const MapWrapper = ({ places, coords }: Props) => {
    return (
        <MapNoSSR places={places} zoom={15} coords={coords} />
    )
}