import { getDefaultCities } from '@/shared/consts/data'
import { getTranslations } from '@/shared/i18n/server'
import { CityList } from './components/CityList'
import { SearchInput } from './components/SearchInput'
import { CitySearchProvider } from './context/useCitySearch'

export default async function BuscadorPage() {
  const { t } = await getTranslations()
  const cities = await getDefaultCities()

  return (
    <CitySearchProvider cities={cities}>
      <div className="flex min-h-screen flex-col gap-6 p-4">
        <div
          className="relative flex min-h-[300px] flex-col items-center justify-center gap-6 rounded-xl bg-cover bg-center bg-no-repeat px-6 pb-12 text-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="z-10 flex max-w-3xl flex-col gap-2">
            <h1 className="font-serif text-5xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg">
              {t('searchPage.heroTitle')}
            </h1>
            <p className="mx-auto max-w-xl text-lg font-medium text-white/90 drop-shadow-md">
              {t('searchPage.heroDescription')}
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col">
          <div className="flex flex-col gap-8">
            <SearchInput />
            <CityList />
          </div>
        </div>
      </div>
    </CitySearchProvider>
  )
}
