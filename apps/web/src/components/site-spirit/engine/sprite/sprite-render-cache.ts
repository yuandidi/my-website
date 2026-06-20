import type { SpriteSheetConfig } from '../../sprite-config.types'
import { resolveSpriteSheetMetrics } from '../../sprite/sprite-sheet'
import { paintSpriteFrame } from './sprite-canvas-renderer'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load sprite sheet: ${src}`))
    image.src = src
  })
}

export class SpriteRenderCache {
  private readonly images = new Map<string, HTMLImageElement>()
  private readonly loading = new Map<string, Promise<HTMLImageElement>>()
  private buffer: HTMLCanvasElement | null = null

  preload(sources: readonly string[]): Promise<void> {
    const unique = [...new Set(sources)]
    return Promise.all(unique.map((src) => this.ensureImage(src))).then(() => undefined)
  }

  getImage(src: string): HTMLImageElement | undefined {
    const image = this.images.get(src)
    return image?.complete ? image : undefined
  }

  /** 离屏缓冲绘制后再 blit 到显示 canvas，避免换图/换帧时闪白 */
  drawToCanvas(
    displayCanvas: HTMLCanvasElement,
    sheet: SpriteSheetConfig,
    frameIndex: number,
    flipX = false,
  ): boolean {
    const image = this.getImage(sheet.src)
    if (!image) return false

    const { displayWidth, displayHeight } = resolveSpriteSheetMetrics(sheet)

    if (displayCanvas.width !== displayWidth) {
      displayCanvas.width = displayWidth
    }
    if (displayCanvas.height !== displayHeight) {
      displayCanvas.height = displayHeight
    }

    if (!this.buffer) {
      this.buffer = document.createElement('canvas')
    }
    if (this.buffer.width !== displayWidth) {
      this.buffer.width = displayWidth
    }
    if (this.buffer.height !== displayHeight) {
      this.buffer.height = displayHeight
    }

    const bufferCtx = this.buffer.getContext('2d')
    const displayCtx = displayCanvas.getContext('2d')
    if (!bufferCtx || !displayCtx) return false

    paintSpriteFrame(bufferCtx, image, sheet, frameIndex, flipX)
    displayCtx.imageSmoothingEnabled = false
    displayCtx.clearRect(0, 0, displayWidth, displayHeight)
    displayCtx.drawImage(this.buffer, 0, 0)

    return true
  }

  private ensureImage(src: string): Promise<HTMLImageElement> {
    const cached = this.images.get(src)
    if (cached?.complete) return Promise.resolve(cached)

    const pending = this.loading.get(src)
    if (pending) return pending

    const promise = loadImage(src).then((image) => {
      this.images.set(src, image)
      this.loading.delete(src)
      return image
    })

    this.loading.set(src, promise)
    return promise
  }
}

let sharedCache: SpriteRenderCache | null = null

export function getSpriteRenderCache(): SpriteRenderCache {
  if (!sharedCache) {
    sharedCache = new SpriteRenderCache()
  }
  return sharedCache
}
