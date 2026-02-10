"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OSMElement, OverpassResponse } from "@/shared/types/locations";

const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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
    places: any[]
    coords: number[]
    zoom: number
    flyTo?: [number, number] | null
}

export default function Map({ places, coords, zoom, flyTo = null }: MapProps) {

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

                        {places.map((poi: any) => {
                            const lat = poi.lat || poi.center?.lat;
                            const lon = poi.lon || poi.center?.lon;

                            if (!lat || !lon) return null;

                            return (
                                <Marker key={poi.id} position={[lat, lon]}>
                                    <Popup>
                                        <h3 className="font-bold">{poi.tags.name || "Sitio Histórico"}</h3>
                                        <p className="text-xs italic">{poi.tags.historic === "archaeological_site" ? "Sitio Arqueológico" : "Turismo"}</p>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                )
            }
        </div>
    );
}