'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { AuthProvider } from '@/contexts/auth-provider'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  )
}
