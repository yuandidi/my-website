'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { getGiscusConfig } from '@/lib/giscus-config'
import {
  applyGiscusTheme,
  getGiscusColorMode,
  GISCUS_IFRAME_SELECTOR,
  GISCUS_ORIGIN,
  resolveActiveGiscusThemeUrl,
  type GiscusColorMode,
} from '@/lib/giscus-theme'

const GISCUS_SCRIPT_SRC = 'https://giscus.app/client.js'

function waitForGiscusIframe(onReady: () => void) {
  if (document.querySelector(GISCUS_IFRAME_SELECTOR)) {
    onReady()
    return () => {}
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector(GISCUS_IFRAME_SELECTOR)) {
      observer.disconnect()
      onReady()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

function retryApplyTheme(mode: GiscusColorMode, attempts = 8) {
  if (applyGiscusTheme(mode)) {
    return () => {}
  }

  let count = 0
  const timer = window.setInterval(() => {
    count += 1
    if (applyGiscusTheme(mode) || count >= attempts) {
      window.clearInterval(timer)
    }
  }, 400)

  return () => window.clearInterval(timer)
}

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = useMemo(() => getGiscusConfig(), [])
  const [colorMode, setColorMode] = useState<GiscusColorMode>(() =>
    getGiscusColorMode(),
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setColorMode(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

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
    script.setAttribute(
      'data-theme',
      resolveActiveGiscusThemeUrl(getGiscusColorMode()),
    )
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')

    container.appendChild(script)

    const mode = getGiscusColorMode()
    const stopRetry = retryApplyTheme(mode)
    const stopObserver = waitForGiscusIframe(() => {
      applyGiscusTheme(mode)
    })

    return () => {
      stopRetry()
      stopObserver()
      container.innerHTML = ''
    }
  }, [config])

  useEffect(() => {
    if (!config) {
      return
    }

    const stopRetry = retryApplyTheme(colorMode)

    function handleMessage(event: MessageEvent) {
      if (event.origin !== GISCUS_ORIGIN) {
        return
      }

      applyGiscusTheme(colorMode)
    }

    window.addEventListener('message', handleMessage)
    applyGiscusTheme(colorMode)

    return () => {
      stopRetry()
      window.removeEventListener('message', handleMessage)
    }
  }, [config, colorMode])

  if (!config) {
    return null
  }

  return (
    <section aria-label="评论" className="mt-10 space-y-4">
      <h2 className="font-display text-2xl text-gold">评论</h2>
      <FantasyScroll innerClassName="p-4 sm:p-5">
        <div ref={containerRef} className="giscus min-h-[120px]" />
      </FantasyScroll>
    </section>
  )
}
