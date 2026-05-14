import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Route editing sends uploaded images as base64 inside Server Actions.
    // The default 1 MB limit is too small for this flow.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [new URL('https://upload.wikimedia.org/**')],
  },
}

export default nextConfig
