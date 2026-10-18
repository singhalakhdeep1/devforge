import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // self-contained server bundle for the Docker image
  output: 'standalone',
  // the frontend has its own lockfile; trace dependencies from here, not the backend workspace root
  outputFileTracingRoot: path.resolve(__dirname),
}

export default nextConfig
