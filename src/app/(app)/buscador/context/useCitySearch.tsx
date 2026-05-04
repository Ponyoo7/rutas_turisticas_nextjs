'use client'

import { OSMAddress, WikiData } from '@/shared/types/locations'
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

const SEARCH_DEBOUNCE_MS = 700
const REMOTE_SEARCH_LIMIT = 6
const MIN_REMOTE_QUERY_LENGTH = 3

const mapOSMToWikiData = (city: OSMAddress): WikiData => {
  const normalizedName =
    city.name?.trim() ||
    city.display_name.split(',')[0]?.trim() ||
    city.display_name

  return {
    title: normalizedName,
    extract: city.display_name,
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

    if (normalizedQuery.length < MIN_REMOTE_QUERY_LENGTH) {
      setRemoteCities([])
      return
    }

    let isCancelled = false
    const controller = new AbortController()

    const timeoutId = setTimeout(async () => {
      try {
        const searchParams = new URLSearchParams({
          q: normalizedQuery,
          limit: String(REMOTE_SEARCH_LIMIT),
        })
        const response = await fetch(`/api/cities/search?${searchParams}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Search request failed with ${response.status}`)
        }

        const matches = (await response.json()) as OSMAddress[]

        if (isCancelled) {
          return
        }

        const uniqueByTitle = new Map<string, WikiData>()

        for (const match of matches) {
          const city = mapOSMToWikiData(match)
          const key = normalizeText(city.title)

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
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      isCancelled = true
      controller.abort()
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
      const key = normalizeText(city.title)

      if (!combined.has(key)) {
        combined.set(key, city)
      }
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
    [cities, query, filteredCities],
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
