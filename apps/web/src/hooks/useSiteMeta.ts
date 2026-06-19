import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const SITE_META_STALE_MS = 5 * 60 * 1000

export function useSiteMeta() {
  return useQuery({
    queryKey: ['site-meta'],
    queryFn: () => api.getSiteMeta(),
    staleTime: SITE_META_STALE_MS,
    retry: false,
  })
}
