"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OSMElement, OverpassResponse } from "@/shared/types/locations";
import { Button } from "../ui/button";
import { renderToStaticMarkup } from "react-dom/server";
import {
    IconBuildingBank,
    IconBuildingBridge,
    IconBuildingMonument,
    IconMapPin,
    IconTeapot
} from "@tabler/icons-react";

function FlyToLocation({ coords }: { coords: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 17, { duration: 1.5 });
        }
    }, [coords, map]);

    return null;
}

interface MapProps {
    places: OSMElement[]
    coords: number[]
    zoom: number
    flyTo?: [number, number] | null
    onClick?: (place: OSMElement) => void
    routePlaces?: OSMElement[]
}

const createCustomIcon = (IconComponent: React.ComponentType<any>, bgClass: string) => {
    const iconHtml = renderToStaticMarkup(
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${bgClass} transform transition-transform hover:scale-110`}>
            <IconComponent size={20} color="white" stroke={2} />
            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${bgClass.replace('bg-', 'border-t-')}`}></div>
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const Icons = {
    museum: createCustomIcon(IconBuildingBank, "bg-blue-500"),
    attraction: createCustomIcon(IconBuildingBridge, "bg-orange-500"),
    monument: createCustomIcon(IconBuildingMonument, "bg-red-500"),
    archaeological: createCustomIcon(IconTeapot, "bg-green-500"),
    default: createCustomIcon(IconMapPin, "bg-amber-500")
};

const getIconForPlace = (place: OSMElement) => {
    if (place.tags.tourism === "museum") return Icons.museum;
    if (place.tags.tourism === "attraction") return Icons.attraction;
    if (place.tags.historic === "monument" || place.tags.historic === "memorial") return Icons.monument;
    if (place.tags.historic === "archaeological_site") return Icons.archaeological;
    return Icons.default;
};

function PlaceMarker({ place, onHandleClick }: { place: OSMElement, onHandleClick: (place: OSMElement) => void }) {
    const map = useMap();
    const lat = place.lat || place.center?.lat;
    const lon = place.lon || place.center?.lon;

    if (!lat || !lon) return null;

    return (
        <Marker position={[lat, lon]} icon={getIconForPlace(place)}>
            <Popup>
                <h3 className="font-bold">{place.tags.name || "Sitio Histórico"}</h3>
                <p className="text-xs italic mb-2">{place.tags.historic === "archaeological_site" ? "Sitio Arqueológico" : (place.tags.tourism || "Turismo")}</p>
                <Button size="sm" onClick={() => {
                    onHandleClick(place);
                    map.closePopup();
                }}>
                    Añadir a la ruta
                </Button>
            </Popup>
        </Marker>
    );
}

export default function Map({ places, coords, zoom, flyTo = null, onClick, routePlaces = [] }: MapProps) {

    const handlePlaceClick = (place: OSMElement) => {
        if (onClick) onClick(place)
    }

    return (
        <div className="relative w-full h-[600px]">
            {
                places.length > 0 && (
                    <MapContainer
                        center={coords as any}
                        zoom={zoom}
                        className="w-full h-full rounded-xl shadow-inner"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FlyToLocation coords={flyTo} />

                        {routePlaces.length > 0 && (
                            <Polyline
                                positions={routePlaces.map((p: OSMElement) => [p.lat || p.center?.lat, p.lon || p.center?.lon].filter(Boolean) as [number, number])}
                                color="#805826"
                                weight={10}
                                opacity={0.7}
                            />
                        )}

                        {places.map((poi: any) => (
                            <PlaceMarker
                                key={poi.id}
                                place={poi}
                                onHandleClick={handlePlaceClick}
                            />
                        ))}
                    </MapContainer>
                )
            }
        </div>
    );
}