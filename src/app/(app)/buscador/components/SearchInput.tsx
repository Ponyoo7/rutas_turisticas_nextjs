'use client'

import { Input } from '@/shared/components/ui/input'
import { useCitySearch } from '../context/useCitySearch'

export const SearchInput = () => {
  const { query, setQuery } = useCitySearch()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-artis-primary dark:text-gray-100 text-3xl font-bold tracking-tight font-serif">
        ¿Por dónde te gustaría perderte?
      </h2>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="París, Roma, Madrid..."
        className="h-14 text-lg border-gray-200 focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6"
      />
    </div>
  )
}
