import 'server-only'

import { InterestPlacesResponse } from '../types/interest-places'

export type InterestPlacesCacheRecord = {
  payload: InterestPlacesResponse
  expiresAt: number
  updatedAt: number
}

export interface InterestPlacesCacheStore {
  get(key: string): Promise<InterestPlacesCacheRecord | null>
  set(key: string, record: InterestPlacesCacheRecord): Promise<void>
  delete?(key: string): Promise<void>
}

declare global {
  var __routecraftInterestPlacesCacheStore:
    | InterestPlacesCacheStore
    | undefined
  var __routecraftInterestPlacesMemoryCache:
    | Map<string, InterestPlacesCacheRecord>
    | undefined
}

class MemoryInterestPlacesCacheStore implements InterestPlacesCacheStore {
  private readonly cache: Map<string, InterestPlacesCacheRecord>

  constructor() {
    this.cache =
      globalThis.__routecraftInterestPlacesMemoryCache ?? new Map()
    globalThis.__routecraftInterestPlacesMemoryCache = this.cache
  }

  async get(key: string) {
    return this.cache.get(key) ?? null
  }

  async set(key: string, record: InterestPlacesCacheRecord) {
    this.cache.set(key, record)
  }

  async delete(key: string) {
    this.cache.delete(key)
  }
}

const createInterestPlacesCacheStore = (): InterestPlacesCacheStore => {
  // This abstraction is ready to swap to Vercel KV / Upstash Redis later
  // without changing the city data flow again.
  return new MemoryInterestPlacesCacheStore()
}

export const interestPlacesCacheStore =
  globalThis.__routecraftInterestPlacesCacheStore ??
  createInterestPlacesCacheStore()

globalThis.__routecraftInterestPlacesCacheStore = interestPlacesCacheStore
