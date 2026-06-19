'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import type { SiteProfile } from '@my-blog/shared'
import { ApiError, api } from '@/lib/api'
import { SITE_PROFILE_FALLBACK } from '@/lib/profile'

const PROFILE_STALE_MS = 5 * 60 * 1000

export function useSiteProfile() {
  const pathname = usePathname()
  const onProfileRoute =
    pathname === '/profile' || pathname.startsWith('/profile/')

  return useQuery({
    queryKey: ['profile'],
    enabled: onProfileRoute,
    staleTime: PROFILE_STALE_MS,
    queryFn: async (): Promise<SiteProfile> => {
      try {
        return await api.getProfile()
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return {
            name: SITE_PROFILE_FALLBACK.name,
            title: SITE_PROFILE_FALLBACK.title,
            avatarUrl: SITE_PROFILE_FALLBACK.avatarUrl,
            bio: SITE_PROFILE_FALLBACK.bio,
            skills: [...SITE_PROFILE_FALLBACK.skills],
            links: [...SITE_PROFILE_FALLBACK.links],
            updatedAt: new Date(0).toISOString(),
          }
        }
        throw error
      }
    },
  })
}
