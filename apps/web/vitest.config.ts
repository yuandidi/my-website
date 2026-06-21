import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, '../../lib'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', '../../lib/**/*.test.ts'],
  },
})
