export interface OSMAddress {
    place_id: number;
    licence: string;
    osm_type: "node" | "way" | "relation"; // Los tres tipos estándar de OSM
    osm_id: number;
    boundingbox: [string, string, string, string]; // Array de 4 coordenadas (lat/lon)
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    addresstype: string;
    name: string;
    place_rank: number;
}

export interface OSMElement {
    id: number;
    type: "node" | "way" | "relation";
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
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

export interface WikiData {
    title: string;
    extract: string; // La descripción (resumen)
    thumbnail?: {
        source: string; // URL de la foto
        width: number;
        height: number;
    };
}