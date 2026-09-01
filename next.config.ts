import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // These identifiers are Firebase Web SDK configuration, not private server
  // secrets. Keeping the VITE_* names avoids an environment migration.
  env: {
    VITE_APIKEY: process.env.VITE_APIKEY ?? '',
    VITE_AUTHDOMAIN: process.env.VITE_AUTHDOMAIN ?? '',
    VITE_PROJECTID: process.env.VITE_PROJECTID ?? '',
    VITE_STORAGEBUCKET: process.env.VITE_STORAGEBUCKET ?? '',
    VITE_MESSAGINGSENDERID: process.env.VITE_MESSAGINGSENDERID ?? '',
    VITE_APPID: process.env.VITE_APPID ?? '',
  },
}

export default nextConfig
