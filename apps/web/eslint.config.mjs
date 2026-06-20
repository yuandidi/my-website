import { defineConfig } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'public/**',
      'src/components/site-spirit/generated/**',
    ],
  },
  ...nextCoreWebVitals,
])
