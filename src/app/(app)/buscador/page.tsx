import { getDefaultCities } from '@/shared/consts/data'
import { CityList } from './components/CityList'
import { SearchInput } from './components/SearchInput'
import { CitySearchProvider } from './context/useCitySearch'

export default async function BuscadorPage() {
  const cities = await getDefaultCities()

  return (
    <CitySearchProvider cities={cities}>
      <div>
        <SearchInput />
        <CityList />
      </div>
    </CitySearchProvider>
  )
}
