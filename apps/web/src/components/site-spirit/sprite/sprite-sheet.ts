import { getFrameMetrics } from '../sprite-config'
import type { SpriteSheetConfig } from '../sprite-config.types'

export function resolveSpriteSheetMetrics(sheet: SpriteSheetConfig) {
  return getFrameMetrics(sheet)
}
