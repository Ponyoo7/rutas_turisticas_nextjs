import { wait } from '@/lib/utils'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const ROUTECRAFT_USER_AGENT = 'RouteCraft/1.0 (contacto: cqc1999@gmail.com)'
const ROUTECRAFT_REFERER = 'https://rutas-turisticas-nextjs.vercel.app/'
const WIKIMEDIA_ALLOWED_HOSTS = new Set([
  'upload.wikimedia.org',
  'commons.wikimedia.org',
])
const COMMONS_ALLOWED_PATH_PREFIXES = [
  '/wiki/Special:FilePath/',
  '/wiki/Special:Redirect/file/',
]
const WIKIMEDIA_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const WIKIMEDIA_RETRY_ATTEMPTS = 4
const WIKIMEDIA_RETRY_DELAY_MS = 1200
const IMAGE_CACHE_SECONDS = 60 * 60 * 24
const STALE_WHILE_REVALIDATE_SECONDS = 60 * 60 * 24 * 7

const buildWikimediaHeaders = () => {
  const headers = new Headers()

  headers.set('User-Agent', ROUTECRAFT_USER_AGENT)
  headers.set('Referer', ROUTECRAFT_REFERER)
  headers.set(
    'Accept',
    'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5',
  )

  return headers
}

const getPlaceholderResponse = (request: NextRequest) =>
  Response.redirect(new URL('/museo_placeholder.jpg', request.url), 307)

const getTargetUrl = (request: NextRequest) => {
  const rawUrl = request.nextUrl.searchParams.get('url')

  if (!rawUrl) return null

  try {
    const targetUrl = new URL(rawUrl)
    const hostname = targetUrl.hostname.toLowerCase()

    if (targetUrl.protocol !== 'https:') return null
    if (!WIKIMEDIA_ALLOWED_HOSTS.has(hostname)) return null

    if (
      hostname === 'commons.wikimedia.org' &&
      !COMMONS_ALLOWED_PATH_PREFIXES.some((prefix) =>
        targetUrl.pathname.startsWith(prefix),
      )
    ) {
      return null
    }

    return targetUrl
  } catch {
    return null
  }
}

const getRetryDelayMs = (response: Response, attempt: number) => {
  const retryAfterHeader = response.headers.get('retry-after')

  if (!retryAfterHeader) {
    return WIKIMEDIA_RETRY_DELAY_MS * (attempt + 1)
  }

  const retryAfterSeconds = Number(retryAfterHeader)

  if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds <= 0) {
    return WIKIMEDIA_RETRY_DELAY_MS * (attempt + 1)
  }

  return retryAfterSeconds * 1000
}

export async function GET(request: NextRequest) {
  const targetUrl = getTargetUrl(request)

  if (!targetUrl) return getPlaceholderResponse(request)

  for (let attempt = 0; attempt < WIKIMEDIA_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(targetUrl.toString(), {
        headers: buildWikimediaHeaders(),
        redirect: 'follow',
        next: { revalidate: IMAGE_CACHE_SECONDS },
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') ?? ''

        if (!contentType.startsWith('image/')) {
          return getPlaceholderResponse(request)
        }

        const headers = new Headers()

        headers.set('Content-Type', contentType)
        headers.set(
          'Cache-Control',
          `public, max-age=${IMAGE_CACHE_SECONDS}, s-maxage=${IMAGE_CACHE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
        )

        return new Response(response.body, {
          status: 200,
          headers,
        })
      }

      if (response.status === 404) {
        return getPlaceholderResponse(request)
      }

      if (
        WIKIMEDIA_RETRYABLE_STATUS_CODES.has(response.status) &&
        attempt < WIKIMEDIA_RETRY_ATTEMPTS - 1
      ) {
        await wait(getRetryDelayMs(response, attempt))
        continue
      }

      return getPlaceholderResponse(request)
    } catch {
      if (attempt < WIKIMEDIA_RETRY_ATTEMPTS - 1) {
        await wait(WIKIMEDIA_RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      return getPlaceholderResponse(request)
    }
  }

  return getPlaceholderResponse(request)
}
