'use client'

import { useEffect, useMemo, useRef } from 'react'
import { getGiscusConfig } from '@/lib/giscus-config'

const GISCUS_SCRIPT_SRC = 'https://giscus.app/client.js'

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = useMemo(() => getGiscusConfig(), [])

  useEffect(() => {
    if (!config || !containerRef.current) {
      return
    }

    const container = containerRef.current
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = GISCUS_SCRIPT_SRC
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', config.repo)
    script.setAttribute('data-repo-id', config.repoId)
    script.setAttribute('data-category', config.category)
    script.setAttribute('data-category-id', config.categoryId)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', config.theme)
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')

    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [config])

  if (!config) {
    return null
  }

  return (
    <section aria-label="评论" className="mt-10 space-y-4">
      <h2 className="font-display text-2xl text-gold">评论</h2>
      <div ref={containerRef} className="giscus min-h-[120px]" />
    </section>
  )
}
