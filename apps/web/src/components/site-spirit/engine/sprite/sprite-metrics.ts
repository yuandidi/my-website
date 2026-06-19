import { getFrameMetrics } from '../../sprite-config'
import type { SpriteSheetConfig } from '../../sprite-config.types'

const STRIDE_CYCLE_WIDTH_RATIO = 0.52

export function getSpriteDisplayWidth(sheet: SpriteSheetConfig): number {
  return getFrameMetrics(sheet).displayWidth
}

/** 每推进一帧对应的水平位移（与步态周期对齐） */
export function getStridePerFrame(sheet: SpriteSheetConfig): number {
  const displayWidth = getSpriteDisplayWidth(sheet)
  const pixelsPerCycle = displayWidth * STRIDE_CYCLE_WIDTH_RATIO
  return pixelsPerCycle / sheet.frameCount
}
