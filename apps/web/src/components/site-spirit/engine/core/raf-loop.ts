import type { FrameTick } from './types'

export interface RafLoopHandle {
  start(onFrame: (tick: FrameTick) => void): void
  stop(): void
}

export function createRafLoop(): RafLoopHandle {
  let rafId = 0
  let lastTimestamp = 0
  let elapsedMs = 0
  let running = false
  let onFrame: ((tick: FrameTick) => void) | null = null

  function frame(timestamp: number): void {
    if (!running || !onFrame) return

    const deltaMs = lastTimestamp === 0 ? 0 : timestamp - lastTimestamp
    lastTimestamp = timestamp
    elapsedMs += deltaMs

    onFrame({
      deltaMs,
      elapsedMs,
      timestamp,
    })

    rafId = window.requestAnimationFrame(frame)
  }

  return {
    start(callback) {
      if (running) return
      onFrame = callback
      running = true
      lastTimestamp = 0
      rafId = window.requestAnimationFrame(frame)
    },
    stop() {
      running = false
      onFrame = null
      window.cancelAnimationFrame(rafId)
      rafId = 0
      lastTimestamp = 0
    },
  }
}
