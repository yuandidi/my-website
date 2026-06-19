'use client'

import { cn } from '@/lib/utils'
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
  const { frameWidth, scale, displayWidth, displayHeight } =
    resolveSpriteSheetMetrics(sheet)
  const xOffset = sheet.crop.left + frameIndex * frameWidth

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'image-pixelated pointer-events-none select-none bg-no-repeat',
        className,
      )}
      style={{
        width: displayWidth,
        height: displayHeight,
        transform: flipX ? 'scaleX(-1)' : undefined,
        backgroundImage: `url(${sheet.src})`,
        backgroundSize: `${sheet.sheetWidth * scale}px ${sheet.sheetHeight * scale}px`,
        backgroundPosition: `-${xOffset * scale}px -${sheet.crop.top * scale}px`,
      }}
    />
  )
}
