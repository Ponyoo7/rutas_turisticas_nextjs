'use client'

interface MapSearchProps {
  search: string
  onSearchChange: (value: string) => void
  filteredPlaces: any[]
  onSelectPlace: (place: any) => void
}

export const MapSearch = ({
  search,
  onSearchChange,
  filteredPlaces,
  onSelectPlace,
}: MapSearchProps) => {
  return (
    <div className="flex flex-col relative mb-4 w-full gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
          Busca tu próximo destino...
        </h2>
        <div className="h-px w-full bg-gray-200 flex-1"></div>
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          placeholder="Buscar lugar de interés..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-artis-primary focus:border-transparent transition-all text-sm"
        />
      </div>

      {/* Resultados del buscador */}
      {search.trim() && filteredPlaces.length > 0 && (
        <ul className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredPlaces.map((place) => (
            <li
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
            >
              <span className="text-artis-primary">
                <svg
                  className="w-4 h-4"
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
                    ? 'Sitio Arqueológico'
                    : 'Turismo'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {search.trim() && filteredPlaces.length === 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm text-gray-400">No se encontraron resultados</p>
        </div>
      )}
    </div>
  )
}
