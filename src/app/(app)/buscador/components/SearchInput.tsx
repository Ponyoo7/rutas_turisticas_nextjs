'use client'

import { Input } from '@/shared/components/ui/input'
import { useCitySearch } from '../context/useCitySearch'

export const SearchInput = () => {
  const { query, setQuery } = useCitySearch()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
          ¿Por dónde te gustaría perderte?
        </h2>
        <div className="h-px w-full bg-gray-200 flex-1"></div>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="París, Roma, Madrid..."
        className="h-14 text-lg border-artis-primary focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6"
      />
    </div>
  )
}
