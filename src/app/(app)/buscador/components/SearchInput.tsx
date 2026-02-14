'use client'

import { Input } from '@/shared/components/ui/input'
import { useCitySearch } from '../context/useCitySearch'

export const SearchInput = () => {
  const { query, setQuery } = useCitySearch()

  return (
    <div>
      <h2>Por donde te gustaria perderte?</h2>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder='Paris, Roma, Madrid...'
      />
    </div>
  )
}
