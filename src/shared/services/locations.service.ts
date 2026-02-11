import { OSMAddress, OverpassResponse, WikiData } from "../types/locations"

const getCityByName = async (name: string): Promise<OSMAddress | null> => {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`
    )
    const dataJson = await res.json()

    return dataJson.length > 0 ? dataJson.at(0) : null
}

const getCoordsByCity = (city: OSMAddress): number[] => {
    return [parseFloat(city.lat), parseFloat(city.lon)]
}

const getInterestPlaces = async (coords: number[]) => {
    const maxAttempts = 1
    let currentAttemps = 0

    while (currentAttemps < maxAttempts) {
        try {
            const query = `
                [out:json][timeout:60];
                (
                    // Buscamos Nodos, Ways y Relations (nwr)
                    nwr["tourism"~"museum|attraction"](around:3000, ${coords[0]}, ${coords[1]});
                    nwr["historic"~"monument|memorial|archaeological_site"](around:3000, ${coords[0]}, ${coords[1]});
                );
                // Importante: 'out center' para obtener coordenadas de áreas
                out center;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data: OverpassResponse = await response.json();

            return data ? data.elements.filter(e => e.tags.name && e.tags.wikipedia) : []
        } catch (e) {
            console.error(e)

            currentAttemps++
        }
    }

    return []
}

const getInterestPlacesByName = async (name: string) => {
    const city = await getCityByName(name)

    if (!city) return


    const coords = getCoordsByCity(city)

    if (!coords) return

    const places = await getInterestPlaces(coords)

    return {
        coords, places
    }
}

const getWikiInfo = async (wikiTag: string): Promise<WikiData | null> => {
    console.log(wikiTag)
    // wikiTag suele ser "es:Coliseo" -> separamos el idioma y el título
    const [lang, title] = wikiTag.split(":");
    const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(title)}&pithumbsize=500&origin=*`;

    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === "-1") return null; // No se encontró la página

        return {
            title: pages[pageId].title,
            extract: pages[pageId].extract,
            thumbnail: pages[pageId].thumbnail,
        };
    } catch (error) {
        console.error("Error en Wikipedia API:", error);
        return null;
    }
}

export const locationsService = {
    getCityByName,
    getCoordsByCity,
    getInterestPlaces,
    getInterestPlacesByName,
    getWikiInfo
}