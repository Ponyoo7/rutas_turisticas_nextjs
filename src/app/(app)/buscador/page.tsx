import { getDefaultCities } from '@/shared/consts/data'
import { CityList } from './components/CityList'
import { SearchInput } from './components/SearchInput'
import { CitySearchProvider } from './context/useCitySearch'

export default async function BuscadorPage() {
  const cities = await getDefaultCities()

  return (
    <CitySearchProvider cities={cities}>
      <div className="flex flex-col gap-6 min-h-screen p-4">
        {/* Hero Section */}
        <div
          className="relative flex min-h-[300px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 pb-12 text-center rounded-xl"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="flex flex-col gap-2 z-10 max-w-3xl">
            <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tight font-serif drop-shadow-lg">
              Encuentra tu próximo destino
            </h1>
            <p className="text-white/90 text-lg font-medium max-w-xl mx-auto drop-shadow-md">
              Explora las ciudades más emblemáticas y crea rutas culturales a tu
              medida.
            </p>
          </div>
        </div>

        <div className="flex flex-col max-w-7x1 mx-auto w-full">
          <div className="flex flex-col gap-8">
            <SearchInput />
            <CityList />
          </div>
        </div>
      </div>
    </CitySearchProvider>
  )
}
