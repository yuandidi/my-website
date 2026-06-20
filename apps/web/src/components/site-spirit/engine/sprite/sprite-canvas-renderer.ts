import { resolveSpriteSheetMetrics } from '../../sprite/sprite-sheet'
import type { SpriteSheetConfig } from '../../sprite-config.types'

export interface SpriteSourceRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export function getSpriteSourceRect(
  sheet: SpriteSheetConfig,
  frameIndex: number,
): SpriteSourceRect {
  const frameWidth = sheet.frameWidth
  const frameHeight =
    sheet.frameHeight ?? sheet.sheetHeight - sheet.crop.top - sheet.crop.bottom

  return {
    sx: sheet.crop.left + frameIndex * frameWidth,
    sy: sheet.crop.top,
    sw: frameWidth,
    sh: frameHeight,
  }
}

export function paintSpriteFrame(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sheet: SpriteSheetConfig,
  frameIndex: number,
  flipX = false,
): void {
  const { displayWidth, displayHeight } = resolveSpriteSheetMetrics(sheet)
  const { sx, sy, sw, sh } = getSpriteSourceRect(sheet, frameIndex)

  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, displayWidth, displayHeight)

  if (flipX) {
    ctx.save()
    ctx.translate(displayWidth, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, displayWidth, displayHeight)
    ctx.restore()
    return
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, displayWidth, displayHeight)
}
