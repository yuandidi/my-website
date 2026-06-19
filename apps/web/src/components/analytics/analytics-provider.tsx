'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { isPublicAnalyticsPath, track } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!isPublicAnalyticsPath(pathname)) {
      return
    }

    const query = searchParams.toString()
    const trackKey = query ? `${pathname}?${query}` : pathname

    if (lastTracked.current === trackKey) {
      return
    }

    lastTracked.current = trackKey
    track('page_view', query ? { query } : undefined, pathname)
  }, [pathname, searchParams])

  return children
}
