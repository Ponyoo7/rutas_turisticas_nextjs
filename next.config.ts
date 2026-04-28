import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 92],
    localPatterns: [
      {
        pathname: '/api/wiki-image',
      },
    ],
    remotePatterns: [new URL('https://upload.wikimedia.org/**')],
  },
}

export default nextConfig
