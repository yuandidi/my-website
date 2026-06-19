export interface SpriteSheetConfig {
  src: string
  frameCount: number
  sheetWidth: number
  sheetHeight: number
  frameWidth: number
  crop: {
    top: number
    left: number
    right: number
    bottom: number
  }
  /** 裁剪后角色脚/阴影接地点，距裁剪区域底部的像素（用于与顶栏底边对齐） */
  baselineFromCropBottom: number
  fps: number
  displayHeight: number
}
