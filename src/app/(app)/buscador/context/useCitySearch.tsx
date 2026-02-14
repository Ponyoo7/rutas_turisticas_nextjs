'use client'

import { locationsService } from '@/shared/services/locations.service'
import { WikiData } from '@/shared/types/locations'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type CitySearchContextValue = {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  cities: WikiData[]
  filteredCities: WikiData[]
}

const CitySearchContext = createContext<CitySearchContextValue | null>(null)

type CitySearchProviderProps = {
  children: ReactNode
  cities: WikiData[]
}

const mapOSMToWikiData = (displayName: string): WikiData => {
  const normalizedName = displayName.split(',')[0]?.trim() || displayName

  return {
    title: normalizedName,
    extract: displayName,
  }
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const getSimilarityScore = (title: string, query: string) => {
  const normalizedTitle = normalizeText(title)
  const normalizedQuery = normalizeText(query)

  if (normalizedTitle.startsWith(normalizedQuery)) {
    return 3
  }

  if (normalizedTitle.includes(normalizedQuery)) {
    return 2
  }

  return 0
}

export const CitySearchProvider = ({
  children,
  cities,
}: CitySearchProviderProps) => {
  const [query, setQuery] = useState('')
  const [remoteCities, setRemoteCities] = useState<WikiData[]>([])

  useEffect(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      return
    }

    let isCancelled = false

    const timeoutId = setTimeout(async () => {
      try {
        const matches = await locationsService.getCitiesByName(normalizedQuery, 10)

        if (isCancelled) {
          return
        }

        const uniqueByTitle = new Map<string, WikiData>()

        for (const match of matches) {
          const city = mapOSMToWikiData(match.display_name)
          const key = city.title.toLowerCase()

          if (!uniqueByTitle.has(key)) {
            uniqueByTitle.set(key, city)
          }
        }

        setRemoteCities(Array.from(uniqueByTitle.values()))
      } catch {
        if (!isCancelled) {
          setRemoteCities([])
        }
      }
    }, 350)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [query])

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      return cities
    }

    const localMatches = cities
      .map((city) => ({
        city,
        score: getSimilarityScore(city.title, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.city)

    const combined = new Map<string, WikiData>()

    for (const city of localMatches) {
      combined.set(normalizeText(city.title), city)
    }

    for (const city of remoteCities) {
      combined.set(normalizeText(city.title), city)
    }

    return Array.from(combined.values())
  }, [cities, query, remoteCities])

  const value = useMemo(
    () => ({
      query,
      setQuery,
      cities,
      filteredCities,
    }),
    [cities, query, filteredCities]
  )

  return (
    <CitySearchContext.Provider value={value}>
      {children}
    </CitySearchContext.Provider>
  )
}

export const useCitySearch = () => {
  const context = useContext(CitySearchContext)

  if (!context) {
    throw new Error('useCitySearch must be used within CitySearchProvider')
  }

  return context
}
