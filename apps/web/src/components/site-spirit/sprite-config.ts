import type { SpriteSheetConfig } from './sprite-config.types'
import {
  CAST_LEFT_SPRITE_SHEET,
  FRONT_WALK_SPRITE_SHEET,
  KNOCKDOWN_SPRITE_SHEET,
  SPIRIT_STATE_SHEETS,
  WALK_BACK_SPRITE_SHEET,
  WALK_LEFT_SPRITE_SHEET,
  WALK_RIGHT_STAFF_SPRITE_SHEET,
} from './generated/sprite-sheets.generated'

export type { SpriteSheetConfig } from './sprite-config.types'
export {
  CAST_LEFT_SPRITE_SHEET,
  FRONT_WALK_SPRITE_SHEET,
  KNOCKDOWN_SPRITE_SHEET,
  SPIRIT_STATE_SHEETS,
  WALK_BACK_SPRITE_SHEET,
  WALK_LEFT_SPRITE_SHEET,
  WALK_RIGHT_STAFF_SPRITE_SHEET,
}

export function getFrameMetrics(sheet: SpriteSheetConfig) {
  const frameWidth = sheet.frameWidth
  const frameHeight = sheet.sheetHeight - sheet.crop.top - sheet.crop.bottom
  const scale = sheet.displayHeight / frameHeight
  const displayWidth = frameWidth * scale
  const baselineOffsetPx = sheet.baselineFromCropBottom * scale

  return {
    frameWidth,
    frameHeight,
    scale,
    displayWidth,
    displayHeight: sheet.displayHeight,
    baselineOffsetPx,
  }
}
