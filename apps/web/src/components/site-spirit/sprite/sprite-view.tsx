'use client'

import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getSpriteRenderCache } from '../engine/sprite/sprite-render-cache'
import { resolveSpriteSheetMetrics } from './sprite-sheet'
import type { SpriteSheetConfig } from '../sprite-config.types'

interface SpriteViewProps {
  sheet: SpriteSheetConfig
  frameIndex: number
  flipX?: boolean
  className?: string
  'aria-label'?: string
}

export function SpriteView({
  sheet,
  frameIndex,
  flipX = false,
  className,
  'aria-label': ariaLabel = '编码女巫小精灵',
}: SpriteViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { displayWidth, displayHeight } = resolveSpriteSheetMetrics(sheet)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cache = getSpriteRenderCache()
    if (cache.drawToCanvas(canvas, sheet, frameIndex, flipX)) return

    let cancelled = false
    void cache.preload([sheet.src]).then(() => {
      if (!cancelled) {
        cache.drawToCanvas(canvas, sheet, frameIndex, flipX)
      }
    })

    return () => {
      cancelled = true
    }
  }, [sheet, frameIndex, flipX])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      width={displayWidth}
      height={displayHeight}
      className={cn(
        'image-pixelated pointer-events-none select-none',
        className,
      )}
    />
  )
}
