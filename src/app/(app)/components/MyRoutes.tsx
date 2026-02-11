'use client'

import { useUserStore } from "@/shared/stores/useUserStore"
import { RouteCard, Route } from "./RouteCard"

const placeholderRoutes: Route[] = [
    {
        title: 'Centro Histórico',
        description: 'Descubre los secretos mejor guardados del casco antiguo.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Ruta de los Museos',
        description: 'Un recorrido por las galerías de arte más importantes.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Gastronomía Local',
        description: 'Prueba los sabores tradicionales de la región.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Parques y Jardines',
        description: 'Relájate en los pulmones verdes de la ciudad.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Arquitectura Moderna',
        description: 'Explora los edificios que definen el skyline actual.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Ruta Nocturna',
        description: 'La magia de la ciudad iluminada tras el atardecer.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Miradores Espectaculares',
        description: 'Las mejores vistas panorámicas para tus fotos.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Tradiciones y Culto',
        description: 'Visita los templos y centros espirituales emblemáticos.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Río y Ribera',
        description: 'Un paseo refrescante a lo largo del cauce fluvial.',
        image: '/museo_placeholder.jpg'
    },
    {
        title: 'Arte Callejero',
        description: 'Murales y expresiones urbanas en cada rincón.',
        image: '/museo_placeholder.jpg'
    }
]

export const MyRoutes = () => {
    const user = useUserStore(state => state.user)

    return (
        <div className="flex flex-col gap-3">
            {
                user && (
                    <>
                        <h2 className="text-2xl font-bold">Mis rutas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {
                                placeholderRoutes.map((r, i) => (
                                    <RouteCard key={i} route={r} />
                                ))
                            }
                        </div>

                    </>
                )
            }

        </div>
    )
}