"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

interface MapProps {
    places: any[]
    coords: number[]
    zoom: number
}

export default function Map({ places, coords, zoom }: MapProps) {


    return (
        <div className="relative w-full h-[600px]">
            {/* {loading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50">
                    <span className="p-3 bg-white rounded-lg shadow-xl font-bold">Buscando tesoros culturales...</span>
                </div>
            )} */}

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

                        {places.map((poi: any) => {
                            // Obtenemos la latitud y longitud sin importar el tipo de objeto
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