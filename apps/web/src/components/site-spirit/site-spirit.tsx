'use client'

import { useEffect, useMemo, useRef } from 'react'
import { createSpiritEngine, useGameEngine } from './engine'
import { getFrameMetrics } from './sprite-config'
import { SpriteView } from './sprite/sprite-view'

/** 与 site-header 的 border-b-2 对齐，让脚/shadow 落在顶栏底边线上 */
const HEADER_BORDER_PX = 2

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SiteSpirit() {
  const mountRef = useRef<HTMLDivElement>(null)
  const engine = useMemo(
    () => createSpiritEngine({ paused: prefersReducedMotion() }),
    [],
  )
  const state = useGameEngine(engine)

  useEffect(() => {
    const header = mountRef.current?.closest('header')
    if (!header) return

    const syncViewport = () => {
      engine.updateViewport(header.clientWidth)
    }

    syncViewport()
    const observer = new ResizeObserver(syncViewport)
    observer.observe(header)
    return () => observer.disconnect()
  }, [engine])

  const { baselineOffsetPx } = useMemo(
    () => getFrameMetrics(state.animation.sheet),
    [state.animation.sheet],
  )

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0 overflow-visible"
      aria-hidden
    >
      <div
        className="absolute bottom-0 will-change-transform"
        style={{
          left: state.behavior.x,
          transform: `translateY(${baselineOffsetPx + HEADER_BORDER_PX}px)`,
        }}
      >
        <SpriteView
          sheet={state.animation.sheet}
          frameIndex={state.animation.frameIndex}
          flipX={state.behavior.flipX}
        />
      </div>
    </div>
  )
}
