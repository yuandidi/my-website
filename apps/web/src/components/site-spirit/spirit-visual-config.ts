import {
  FRONT_WALK_SPRITE_SHEET,
  SPIRIT_STATE_SHEETS,
} from './sprite-config'
import type { SpriteSheetConfig } from './sprite-config.types'
import type { SpiritMode, SpiritSheetId } from './spirit-modes'

/** front-walk 雪碧图第 2 帧（1-based）作为正面 idle 定帧 */
export const FRONT_IDLE_FRAME_INDEX = 1

export interface SpiritVisualConfig {
  sheet: SpriteSheetConfig
  loop: boolean
  fixedFrameIndex?: number
}

const SHEET_VISUALS: Record<
  SpiritSheetId,
  Pick<SpiritVisualConfig, 'loop'>
> = {
  'front-walk': { loop: true },
  'walk-right-staff': { loop: true },
  'walk-back': { loop: true },
  'cast-left': { loop: false },
  'knockdown': { loop: false },
  'walk-left': { loop: true },
}

export function resolveSpiritVisual(mode: SpiritMode): SpiritVisualConfig {
  if (mode === 'front-idle') {
    return {
      sheet: FRONT_WALK_SPRITE_SHEET,
      loop: false,
      fixedFrameIndex: FRONT_IDLE_FRAME_INDEX,
    }
  }

  const sheet = SPIRIT_STATE_SHEETS[mode]
  const visual = SHEET_VISUALS[mode]

  return {
    sheet,
    loop: visual.loop,
  }
}
