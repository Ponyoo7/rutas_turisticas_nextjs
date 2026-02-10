'use client'

import { useState, useMemo } from "react";

export const useMapSearch = (places: any[]) => {
    const [search, setSearch] = useState("");
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

    const filteredPlaces = useMemo(() => {
        if (!search.trim()) return [];
        const query = search.toLowerCase();
        return places.filter((place) => {
            const name = place.tags?.name?.toLowerCase() || "";
            return name.includes(query);
        });
    }, [search, places]);

    const handleSelectPlace = (place: any) => {
        const lat = place.lat || place.center?.lat;
        const lon = place.lon || place.center?.lon;
        if (lat && lon) {
            setFlyTo([lat, lon]);
            setSearch(place.tags?.name || "");
        }
    };

    return {
        search,
        setSearch,
        flyTo,
        setFlyTo,
        filteredPlaces,
        handleSelectPlace
    };
};
