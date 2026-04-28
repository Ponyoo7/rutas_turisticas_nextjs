'use client'

import { OSMElement } from '@/shared/types/locations'

interface MapSearchProps {
  search: string
  onSearchChange: (value: string) => void
  filteredPlaces: OSMElement[]
  onSelectPlace: (place: OSMElement) => void
  disabled?: boolean
  placeholder?: string
}

export const MapSearch = ({
  search,
  onSearchChange,
  filteredPlaces,
  onSelectPlace,
  disabled = false,
  placeholder = 'Buscar lugar de interes...',
}: MapSearchProps) => {
  return (
    <div className="relative mb-4 flex w-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-artis-primary dark:text-gray-100">
          Busca tu proximo destino...
        </h2>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="relative m-2">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-artis-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>

      {!disabled && search.trim() && filteredPlaces.length > 0 && (
        <ul className="absolute z-[9999] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {filteredPlaces.map((place) => (
            <li
              key={`${place.type}-${place.id}`}
              onClick={() => onSelectPlace(place)}
              className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-blue-50"
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

      {!disabled && search.trim() && filteredPlaces.length === 0 && (
        <div className="absolute z-[9999] mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-gray-400">No se encontraron resultados</p>
        </div>
      )}
    </div>
  )
}
