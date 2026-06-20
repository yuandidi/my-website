import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@my-blog/shared'],
  serverExternalPackages: ['@neondatabase/serverless', 'ws'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-separator', '@radix-ui/react-slot'],
  },
}

export default nextConfig
