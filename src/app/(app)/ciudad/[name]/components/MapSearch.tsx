'use client'

import { OSMElement } from '@/shared/types/locations'

interface MapSearchProps {
  search: string
  onSearchChange: (value: string) => void
  filteredPlaces: OSMElement[]
  onSelectPlace: (place: OSMElement) => void
}

export const MapSearch = ({
  search,
  onSearchChange,
  filteredPlaces,
  onSelectPlace,
}: MapSearchProps) => {
  return (
    <div className="mb-4 flex w-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-artis-primary md:text-4xl">
          Busca tu proximo destino...
        </h2>
        <div className="h-px flex-1 bg-[#e6e9ee]"></div>
      </div>

      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar lugar de interes..."
          className="h-12 w-full rounded-full border border-[#d9dfe7] bg-[#f5f6f8] pl-11 pr-4 text-sm shadow-[0_12px_28px_-26px_rgba(15,23,42,0.8)] transition-all focus:border-artis-primary/35 focus:outline-none focus:ring-2 focus:ring-artis-primary/12"
        />

        {search.trim() && filteredPlaces.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-60 overflow-y-auto rounded-[22px] bg-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)]">
            {filteredPlaces.map((place) => (
              <li
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f6f8fa]"
              >
                <span className="text-artis-primary">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {place.tags?.name || 'Sin nombre'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {place.tags?.historic === 'archaeological_site'
                      ? 'Sitio arqueologico'
                      : 'Turismo'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {search.trim() && filteredPlaces.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-[9999] mt-2 rounded-[22px] bg-white px-4 py-3 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)]">
            <p className="text-sm text-gray-400">No se encontraron resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}
