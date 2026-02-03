"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import { OSMElement, OverpassResponse } from "../types/osm";

// types/osm.ts
export interface OSMElement {
    id: number;
    type: "node" | "way" | "relation";
    lat: number;
    lon: number;
    tags: {
        name?: string;
        tourism?: string;
        historic?: string;
        religion?: string;
        website?: string;
        description?: string;
        [key: string]: any; // Para otras etiquetas dinámicas
    };
}

export interface OverpassResponse {
    elements: OSMElement[];
}

// Corregir iconos por defecto en Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: [number, number];
    zoom: number;
}

export function Map({ center, zoom }: MapProps) {
    const [points, setPoints] = useState<OSMElement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPOIs = async () => {
            // Query optimizada para Museos, Monumentos y Sitios Históricos
            const query = `
                [out:json][timeout:35];
                (
                    // Buscamos Nodos, Ways y Relations (nwr)
                    nwr["tourism"~"museum|attraction"](around:3000, ${center[0]}, ${center[1]});
                    nwr["historic"~"monument|memorial|archaeological_site"](around:3000, ${center[0]}, ${center[1]});
                );
                // Importante: 'out center' para obtener coordenadas de áreas
                out center;
            `;

            try {
                const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const data: OverpassResponse = await response.json();
                setPoints(data.elements);

                const test = data.elements.filter(e => e.tags.name && e.tags.wikipedia && e.tags.tourism && e.tags.website)

                console.log(test)
            } catch (error) {
                console.error("Error fetching OSM data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPOIs();
    }, [center]);

    return (
        <div className="relative w-full h-[600px]">
            {loading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50">
                    <span className="p-3 bg-white rounded-lg shadow-xl font-bold">Buscando tesoros culturales...</span>
                </div>
            )}

            <MapContainer
                center={center}
                zoom={zoom}
                className="w-full h-full rounded-xl shadow-inner"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {points.map((poi: any) => {
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
        </div>
    );
}