'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useAnalyticsSummary(days: number) {
  return useQuery({
    queryKey: ['analytics-summary', days],
    queryFn: () => api.getAnalyticsSummary(days),
    staleTime: 60_000,
  })
}
