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

/** 所有小精灵雪碧图 src（去重），供渲染缓存预加载 */
export const SPIRIT_SPRITE_SOURCES = [
  ...new Set(Object.values(SPIRIT_STATE_SHEETS).map((sheet) => sheet.src)),
] as const

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
