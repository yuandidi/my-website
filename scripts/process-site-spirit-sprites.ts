import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const ASSETS_DIR = path.join(ROOT, 'apps/web/assets/site-spirit')
const SOURCE_DIR = path.join(ASSETS_DIR, 'source')
const OUT_DIR = path.join(ROOT, 'apps/web/public/site-spirit')
const GENERATED_TS = path.join(
  ROOT,
  'apps/web/src/components/site-spirit/generated/sprite-sheets.generated.ts',
)

interface SourceCrop {
  top: number
  left: number
  right: number
  bottom: number
}

interface SourceRegion {
  top: number
  left: number
  width: number
  height: number
}

interface GridStateConfig {
  id: string
  row: number
  exportAs?: string
}

interface GridConfig {
  sourceFile: string
  gridCols: number
  gridRows: number
  excludeRows?: number[]
  alphaMode: 'black' | 'purple'
  fps: number
  displayHeight: number
  minBottomRowSpan?: number
  /** grid=保持网格格大小一致；global-trim=全状态统一裁剪框 */
  uniformCellSize?: 'grid' | 'global-trim'
  states: GridStateConfig[]
}

interface SheetConfigEntry {
  id: 'idle' | 'walk-left' | 'walk-right'
  sourceFile: string
  frameCount: number
  sourceCrop?: SourceCrop
  sourceRegion?: SourceRegion
  /** equal=等分；borders=按虚线分隔检测切帧 */
  frameSplit?: 'equal' | 'borders'
  /** 每帧左右内缩，避开虚线边框 */
  columnInsetX?: number
  /** 每帧底部裁掉高度，避开帧号标签 */
  columnBottomTrim?: number
  alphaMode: 'black' | 'purple'
  fps: number
  displayHeight: number
  minBottomRowSpan?: number
}

interface FrameColumn {
  left: number
  width: number
}

interface SheetManifest {
  src: string
  frameCount: number
  sheetWidth: number
  sheetHeight: number
  frameWidth: number
  frameHeight: number
  baselineFromCropBottom: number
  fps: number
  displayHeight: number
  crop: SourceCrop
}

interface RgbaBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

interface FrameBitmap {
  pixels: Buffer
  width: number
  height: number
}

const SHEET_EXPORT_NAMES: Record<SheetConfigEntry['id'], string> = {
  idle: 'IDLE_SPRITE_SHEET',
  'walk-left': 'WALK_LEFT_SPRITE_SHEET',
  'walk-right': 'WALK_RIGHT_SPRITE_SHEET',
}

function isNearBlackBackground(r: number, g: number, b: number): boolean {
  const maxChannel = Math.max(r, g, b)
  const minChannel = Math.min(r, g, b)
  return maxChannel <= 22 && maxChannel - minChannel <= 10
}

/** 从四边泛洪纯黑背景，保留角色内部深色像素为不透明 */
function applyBlackBackgroundAlphaKey(
  pixels: Buffer,
  width: number,
  height: number,
): void {
  const total = width * height
  const isBackground = new Uint8Array(total)
  const flooded = new Uint8Array(total)
  const queue: number[] = []

  for (let i = 0; i < total; i += 1) {
    const offset = i * 4
    if (
      isNearBlackBackground(
        pixels[offset]!,
        pixels[offset + 1]!,
        pixels[offset + 2]!,
      )
    ) {
      isBackground[i] = 1
    }
  }

  const enqueue = (index: number): void => {
    if (index < 0 || index >= total || flooded[index] || !isBackground[index]) {
      return
    }
    flooded[index] = 1
    queue.push(index)
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x)
    enqueue((height - 1) * width + x)
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width)
    enqueue(y * width + (width - 1))
  }

  while (queue.length > 0) {
    const index = queue.pop()!
    const x = index % width
    const y = (index - x) / width
    enqueue(index - 1)
    enqueue(index + 1)
    enqueue(index - width)
    enqueue(index + width)
  }

  for (let i = 0; i < total; i += 1) {
    pixels[i * 4 + 3] = flooded[i] ? 0 : 255
  }
}

function applyAlphaKey(
  pixels: Buffer,
  width: number,
  height: number,
  mode: 'black' | 'purple',
): void {
  if (mode === 'black') {
    applyBlackBackgroundAlphaKey(pixels, width, height)
    return
  }

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!
    const g = pixels[i + 1]!
    const b = pixels[i + 2]!
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    const maxChannel = Math.max(r, g, b)

    let alpha = 255

    const isDarkBackground =
      (luminance < 42 &&
        maxChannel < 52 &&
        b >= r * 0.85 &&
        b >= g * 0.75) ||
      (luminance < 24 && maxChannel < 32)
    if (isDarkBackground) {
      alpha = 0
    } else if (luminance < 72) {
      alpha = Math.round(((luminance - 24) / 48) * 255)
    }

    pixels[i + 3] = alpha
  }
}

function countRowAlphaSpan(
  pixels: Buffer,
  width: number,
  y: number,
  alphaThreshold = 12,
): number {
  let span = 0
  for (let x = 0; x < width; x += 1) {
    if (pixels[(y * width + x) * 4 + 3]! > alphaThreshold) {
      span += 1
    }
  }
  return span
}

function findCharacterBounds(
  pixels: Buffer,
  width: number,
  height: number,
  minBottomRowSpan: number,
): RgbaBounds {
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3]!
      if (alpha <= 12) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('No opaque pixels found after alpha key')
  }

  const segments: Array<{ start: number; end: number }> = []
  let inSegment = false
  let segmentStart = 0

  for (let y = minY; y < height; y += 1) {
    const active = countRowAlphaSpan(pixels, width, y) >= minBottomRowSpan
    if (active && !inSegment) {
      segmentStart = y
      inSegment = true
    } else if (!active && inSegment) {
      segments.push({ start: segmentStart, end: y - 1 })
      inSegment = false
    }
  }
  if (inSegment) {
    segments.push({ start: segmentStart, end: height - 1 })
  }

  if (segments.length >= 2) {
    const last = segments[segments.length - 1]!
    const prev = segments[segments.length - 2]!
    const lastHeight = last.end - last.start + 1
    const prevHeight = prev.end - prev.start + 1
    if (lastHeight < prevHeight * 0.65) {
      maxY = prev.end
    } else {
      maxY = last.end
    }
  } else if (segments.length === 1) {
    maxY = segments[0]!.end
  } else {
    for (let y = height - 1; y >= minY; y -= 1) {
      if (countRowAlphaSpan(pixels, width, y) >= minBottomRowSpan) {
        maxY = y
        break
      }
    }
  }

  return { minX, minY, maxX, maxY }
}

function cropRgba(
  pixels: Buffer,
  width: number,
  height: number,
  bounds: RgbaBounds,
): FrameBitmap {
  const nextWidth = bounds.maxX - bounds.minX + 1
  const nextHeight = bounds.maxY - bounds.minY + 1
  const next = Buffer.alloc(nextWidth * nextHeight * 4)

  for (let y = 0; y < nextHeight; y += 1) {
    for (let x = 0; x < nextWidth; x += 1) {
      const srcX = bounds.minX + x
      const srcY = bounds.minY + y
      const srcIndex = (srcY * width + srcX) * 4
      const dstIndex = (y * nextWidth + x) * 4
      next[dstIndex] = pixels[srcIndex]!
      next[dstIndex + 1] = pixels[srcIndex + 1]!
      next[dstIndex + 2] = pixels[srcIndex + 2]!
      next[dstIndex + 3] = pixels[srcIndex + 3]!
    }
  }

  return { pixels: next, width: nextWidth, height: nextHeight }
}

function composeSheet(
  frames: FrameBitmap[],
  cellWidth: number,
  cellHeight: number,
): FrameBitmap {
  const sheetWidth = cellWidth * frames.length
  const sheet = Buffer.alloc(sheetWidth * cellHeight * 4)

  frames.forEach((frame, index) => {
    const offsetX = index * cellWidth + Math.floor((cellWidth - frame.width) / 2)
    const offsetY = cellHeight - frame.height

    for (let y = 0; y < frame.height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        const srcIndex = (y * frame.width + x) * 4
        const dstX = offsetX + x
        const dstY = offsetY + y
        const dstIndex = (dstY * sheetWidth + dstX) * 4
        sheet[dstIndex] = frame.pixels[srcIndex]!
        sheet[dstIndex + 1] = frame.pixels[srcIndex + 1]!
        sheet[dstIndex + 2] = frame.pixels[srcIndex + 2]!
        sheet[dstIndex + 3] = frame.pixels[srcIndex + 3]!
      }
    }
  })

  return { pixels: sheet, width: sheetWidth, height: cellHeight }
}

/** 将任意帧放入统一尺寸的格子，脚底线对齐底部、水平居中 */
function normalizeFrameToCell(
  frame: FrameBitmap,
  cellWidth: number,
  cellHeight: number,
): FrameBitmap {
  const cell = Buffer.alloc(cellWidth * cellHeight * 4)
  const offsetX = Math.floor((cellWidth - frame.width) / 2)
  const offsetY = cellHeight - frame.height

  for (let y = 0; y < frame.height; y += 1) {
    for (let x = 0; x < frame.width; x += 1) {
      const srcIndex = (y * frame.width + x) * 4
      const dstX = offsetX + x
      const dstY = offsetY + y
      if (dstX < 0 || dstY < 0 || dstX >= cellWidth || dstY >= cellHeight) continue
      const dstIndex = (dstY * cellWidth + dstX) * 4
      cell[dstIndex] = frame.pixels[srcIndex]!
      cell[dstIndex + 1] = frame.pixels[srcIndex + 1]!
      cell[dstIndex + 2] = frame.pixels[srcIndex + 2]!
      cell[dstIndex + 3] = frame.pixels[srcIndex + 3]!
    }
  }

  return { pixels: cell, width: cellWidth, height: cellHeight }
}

async function writePng(
  filePath: string,
  pixels: Buffer,
  width: number,
  height: number,
): Promise<void> {
  await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(filePath)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function detectFrameColumns(
  pixels: Buffer,
  width: number,
  height: number,
  frameCount: number,
): FrameColumn[] {
  const scores = new Array<number>(width).fill(0)
  const yStart = Math.floor(height * 0.12)
  const yEnd = Math.floor(height * 0.88)

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      const r = pixels[index]!
      const g = pixels[index + 1]!
      const b = pixels[index + 2]!
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b
      if (luminance > 35 && luminance < 115) {
        scores[x]! += 1
      }
    }
  }

  const threshold = Math.max(40, Math.floor((yEnd - yStart) * 0.12))
  const separatorCenters: number[] = []

  for (let x = 2; x < width - 2; x += 1) {
    if (scores[x]! < threshold) continue
    if (scores[x]! < scores[x - 1]! || scores[x]! < scores[x + 1]!) continue
    const last = separatorCenters[separatorCenters.length - 1]
    if (last === undefined || x - last > 4) {
      separatorCenters.push(x)
    }
  }

  if (separatorCenters.length !== frameCount - 1) {
    const frameWidth = Math.floor(width / frameCount)
    return Array.from({ length: frameCount }, (_, index) => ({
      left: index * frameWidth,
      width: frameWidth,
    }))
  }

  const columns: FrameColumn[] = []
  let start = 0
  for (const separator of separatorCenters) {
    columns.push({ left: start, width: separator - start })
    start = separator + 1
  }
  columns.push({ left: start, width: width - start })
  return columns
}

async function loadRegionPixels(
  sourcePath: string,
  region: SourceRegion,
): Promise<{ pixels: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(sourcePath)
    .extract(region)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return {
    pixels: Buffer.from(data),
    width: info.width,
    height: info.height,
  }
}

async function resolveSourcePath(config: SheetConfigEntry): Promise<string | null> {
  const dedicatedName =
    config.id === 'walk-left'
      ? 'walk-left-sheet.jpg'
      : config.id === 'walk-right'
        ? 'walk-right-sheet.jpg'
        : null

  if (dedicatedName) {
    for (const ext of ['.jpg', '.jpeg', '.png']) {
      const dedicatedPath = path.join(
        SOURCE_DIR,
        dedicatedName.replace(/\.jpg$/, ext),
      )
      if (await fileExists(dedicatedPath)) {
        return dedicatedPath
      }
    }
  }

  for (const ext of ['.jpg', '.jpeg', '.png']) {
    const sourcePath = path.join(
      SOURCE_DIR,
      config.sourceFile.replace(/\.(jpg|jpeg|png)$/i, ext),
    )
    if (await fileExists(sourcePath)) {
      return sourcePath
    }
  }

  return null
}

async function processSheet(
  config: SheetConfigEntry,
  sourcePath: string,
): Promise<SheetManifest> {
  const minBottomRowSpan = config.minBottomRowSpan ?? 35
  const sourceCrop = config.sourceCrop ?? {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
  const meta = await sharp(sourcePath).metadata()
  const sourceWidth = meta.width
  const sourceHeight = meta.height
  if (!sourceWidth || !sourceHeight) {
    throw new Error(`Unable to read dimensions: ${sourcePath}`)
  }

  const region = config.sourceRegion ?? {
    top: sourceCrop.top,
    left: sourceCrop.left,
    width: sourceWidth - sourceCrop.left - sourceCrop.right,
    height: sourceHeight - sourceCrop.top - sourceCrop.bottom,
  }

  const regionPixels = await loadRegionPixels(sourcePath, region)
  const frameColumns =
    config.frameSplit === 'borders'
      ? detectFrameColumns(
          regionPixels.pixels,
          regionPixels.width,
          regionPixels.height,
          config.frameCount,
        )
      : Array.from({ length: config.frameCount }, (_, index) => {
          const frameWidth = Math.floor(region.width / config.frameCount)
          return { left: index * frameWidth, width: frameWidth }
        })

  if (frameColumns.length !== config.frameCount) {
    throw new Error(`${config.id}: expected ${config.frameCount} frame columns`)
  }

  console.log(
    `  columns ${frameColumns.map((column) => `${column.left}+${column.width}`).join(', ')}`,
  )

  const columnInsetX = config.columnInsetX ?? 0
  const columnBottomTrim = config.columnBottomTrim ?? 0
  const columnHeight = Math.max(1, regionPixels.height - columnBottomTrim)

  const frames: FrameBitmap[] = []

  for (const column of frameColumns) {
    const innerLeft = column.left + columnInsetX
    const innerWidth = column.width - columnInsetX * 2
    if (innerWidth <= 0) {
      throw new Error(`${config.id}: columnInsetX too large for column width`)
    }

    const framePixels = Buffer.alloc(innerWidth * columnHeight * 4)
    for (let y = 0; y < columnHeight; y += 1) {
      for (let x = 0; x < innerWidth; x += 1) {
        const srcIndex = (y * regionPixels.width + innerLeft + x) * 4
        const dstIndex = (y * innerWidth + x) * 4
        framePixels[dstIndex] = regionPixels.pixels[srcIndex]!
        framePixels[dstIndex + 1] = regionPixels.pixels[srcIndex + 1]!
        framePixels[dstIndex + 2] = regionPixels.pixels[srcIndex + 2]!
        framePixels[dstIndex + 3] = regionPixels.pixels[srcIndex + 3]!
      }
    }

    applyAlphaKey(framePixels, innerWidth, columnHeight, config.alphaMode)

    const bounds = findCharacterBounds(
      framePixels,
      innerWidth,
      columnHeight,
      minBottomRowSpan,
    )
    frames.push(
      cropRgba(framePixels, innerWidth, columnHeight, bounds),
    )
  }

  const cellWidth = Math.max(...frames.map((frame) => frame.width))
  const cellHeight = Math.max(...frames.map((frame) => frame.height))
  const sheet = composeSheet(frames, cellWidth, cellHeight)

  const outputBase = `${config.id}-sheet`
  const outputSheet = path.join(OUT_DIR, `${outputBase}.png`)
  const outputFramesDir = path.join(OUT_DIR, config.id)
  const outputManifest = path.join(OUT_DIR, `${outputBase}.json`)

  await fs.mkdir(outputFramesDir, { recursive: true })
  await writePng(outputSheet, sheet.pixels, sheet.width, sheet.height)

  for (const [index, frame] of frames.entries()) {
    const offsetX = index * cellWidth + Math.floor((cellWidth - frame.width) / 2)
    const offsetY = cellHeight - frame.height
    const cell = Buffer.alloc(cellWidth * cellHeight * 4)
    for (let y = 0; y < frame.height; y += 1) {
      for (let x = 0; x < frame.width; x += 1) {
        const srcIndex = (y * frame.width + x) * 4
        const dstIndex = ((offsetY + y) * cellWidth + offsetX + x) * 4
        cell[dstIndex] = frame.pixels[srcIndex]!
        cell[dstIndex + 1] = frame.pixels[srcIndex + 1]!
        cell[dstIndex + 2] = frame.pixels[srcIndex + 2]!
        cell[dstIndex + 3] = frame.pixels[srcIndex + 3]!
      }
    }
    await writePng(
      path.join(outputFramesDir, `${index + 1}.png`),
      cell,
      cellWidth,
      cellHeight,
    )
  }

  const manifest: SheetManifest = {
    src: `/site-spirit/${outputBase}.png`,
    frameCount: config.frameCount,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
    frameWidth: cellWidth,
    frameHeight: cellHeight,
    baselineFromCropBottom: 0,
    fps: config.fps,
    displayHeight: config.displayHeight,
    crop: { top: 0, left: 0, right: 0, bottom: 0 },
  }

  await fs.writeFile(
    outputManifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  console.log(`Processed ${config.id}:`)
  console.log(
    `  source ${path.relative(ROOT, sourcePath)} -> ${path.relative(ROOT, outputSheet)} (${sheet.width}x${sheet.height})`,
  )

  return manifest
}

function manifestToTs(name: string, manifest: SheetManifest): string {
  return `export const ${name}: SpriteSheetConfig = ${JSON.stringify(manifest, null, 2)}`
}

async function writeGeneratedTsExports(
  exports: Array<{ name: string; manifest: SheetManifest }>,
  stateSheetEntries: Array<{ id: string; exportName: string }> = [],
): Promise<void> {
  const blocks = exports.map(({ name, manifest }) =>
    manifestToTs(name, manifest),
  )

  const stateMapBlock =
    stateSheetEntries.length > 0
      ? `\n\nexport const SPIRIT_STATE_SHEETS = {\n${stateSheetEntries
          .map(
            (entry) => `  '${entry.id}': ${entry.exportName},`,
          )
          .join('\n')}\n} as const satisfies Record<string, SpriteSheetConfig>\n\nexport type SpiritStateId = keyof typeof SPIRIT_STATE_SHEETS`
      : ''

  const content = `/* AUTO-GENERATED by pnpm sprites:process — do not edit */
import type { SpriteSheetConfig } from '../sprite-config.types'

${blocks.join('\n\n')}${stateMapBlock}
`

  await fs.mkdir(path.dirname(GENERATED_TS), { recursive: true })
  await fs.writeFile(GENERATED_TS, content, 'utf8')
  console.log(`Updated ${path.relative(ROOT, GENERATED_TS)}`)
}

async function writeGeneratedTs(
  manifests: Partial<Record<SheetConfigEntry['id'], SheetManifest>>,
): Promise<void> {
  const exports = (Object.keys(manifests) as SheetConfigEntry['id'][]).map(
    (id) => ({
      name: SHEET_EXPORT_NAMES[id],
      manifest: manifests[id]!,
    }),
  )
  await writeGeneratedTsExports(exports)
}

async function resolveGridSourcePath(config: GridConfig): Promise<string | null> {
  for (const ext of ['.jpg', '.jpeg', '.png']) {
    const sourcePath = path.join(
      SOURCE_DIR,
      config.sourceFile.replace(/\.(jpg|jpeg|png)$/i, ext),
    )
    if (await fileExists(sourcePath)) {
      return sourcePath
    }
  }
  return null
}

async function extractGridCell(
  sourcePath: string,
  col: number,
  row: number,
  cellSize: number,
  alphaMode: 'black' | 'purple',
  minBottomRowSpan: number,
  trimFrame: boolean,
): Promise<FrameBitmap> {
  const { data, info } = await sharp(sourcePath)
    .extract({
      left: col * cellSize,
      top: row * cellSize,
      width: cellSize,
      height: cellSize,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = Buffer.from(data)

  applyAlphaKey(pixels, info.width, info.height, alphaMode)

  if (!trimFrame) {
    return { pixels, width: info.width, height: info.height }
  }

  try {
    const bounds = findCharacterBounds(
      pixels,
      info.width,
      info.height,
      minBottomRowSpan,
    )
    return cropRgba(pixels, info.width, info.height, bounds)
  } catch {
    return { pixels, width: info.width, height: info.height }
  }
}

async function processGridState(
  config: GridConfig,
  state: GridStateConfig,
  sourcePath: string,
  cellSize: number,
  uniformCellWidth: number,
  uniformCellHeight: number,
  trimFrame: boolean,
): Promise<SheetManifest> {
  const minBottomRowSpan = config.minBottomRowSpan ?? 10
  const frameCount = config.gridCols
  const rawFrames: FrameBitmap[] = []

  for (let col = 0; col < frameCount; col += 1) {
    rawFrames.push(
      await extractGridCell(
        sourcePath,
        col,
        state.row,
        cellSize,
        config.alphaMode,
        minBottomRowSpan,
        trimFrame,
      ),
    )
  }

  const frames = rawFrames.map((frame) =>
    normalizeFrameToCell(frame, uniformCellWidth, uniformCellHeight),
  )
  const sheet = composeSheet(frames, uniformCellWidth, uniformCellHeight)

  const outputBase = `${state.id}-sheet`
  const outputSheet = path.join(OUT_DIR, `${outputBase}.png`)
  const outputFramesDir = path.join(OUT_DIR, state.id)
  const outputManifest = path.join(OUT_DIR, `${outputBase}.json`)

  await fs.mkdir(outputFramesDir, { recursive: true })
  await writePng(outputSheet, sheet.pixels, sheet.width, sheet.height)

  for (const [index, frame] of frames.entries()) {
    await writePng(
      path.join(outputFramesDir, `${index + 1}.png`),
      frame.pixels,
      uniformCellWidth,
      uniformCellHeight,
    )
  }

  const manifest: SheetManifest = {
    src: `/site-spirit/${outputBase}.png`,
    frameCount,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
    frameWidth: uniformCellWidth,
    frameHeight: uniformCellHeight,
    baselineFromCropBottom: 0,
    fps: config.fps,
    displayHeight: config.displayHeight,
    crop: { top: 0, left: 0, right: 0, bottom: 0 },
  }

  await fs.writeFile(
    outputManifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  console.log(`Processed ${state.id} (row ${state.row + 1}):`)
  console.log(
    `  ${path.relative(ROOT, outputSheet)} (${sheet.width}x${sheet.height}, ${frameCount} frames @ ${uniformCellWidth}x${uniformCellHeight})`,
  )

  return manifest
}

async function processCharacterGrid(config: GridConfig): Promise<void> {
  const sourcePath = await resolveGridSourcePath(config)
  if (!sourcePath) {
    throw new Error(`Grid source not found: ${config.sourceFile}`)
  }

  const meta = await sharp(sourcePath).metadata()
  const sourceWidth = meta.width
  const sourceHeight = meta.height
  if (!sourceWidth || !sourceHeight) {
    throw new Error(`Unable to read dimensions: ${sourcePath}`)
  }

  if (
    sourceWidth % config.gridCols !== 0 ||
    sourceHeight % config.gridRows !== 0
  ) {
    throw new Error(
      `Source ${sourceWidth}x${sourceHeight} is not divisible by ${config.gridCols}x${config.gridRows} grid`,
    )
  }

  const cellSize = sourceWidth / config.gridCols
  const excluded = new Set(config.excludeRows ?? [])
  const uniformMode = config.uniformCellSize ?? 'grid'
  const trimFrame = uniformMode === 'global-trim'
  const exports: Array<{ name: string; manifest: SheetManifest }> = []
  const stateSheetEntries: Array<{ id: string; exportName: string }> = []
  const activeStates = config.states.filter((state) => !excluded.has(state.row))

  await fs.mkdir(OUT_DIR, { recursive: true })

  let uniformCellWidth = cellSize
  let uniformCellHeight = cellSize

  if (trimFrame) {
    const trimmedFrames: FrameBitmap[] = []
    for (const state of activeStates) {
      for (let col = 0; col < config.gridCols; col += 1) {
        trimmedFrames.push(
          await extractGridCell(
            sourcePath,
            col,
            state.row,
            cellSize,
            config.alphaMode,
            config.minBottomRowSpan ?? 10,
            true,
          ),
        )
      }
    }
    uniformCellWidth = Math.max(...trimmedFrames.map((frame) => frame.width))
    uniformCellHeight = Math.max(...trimmedFrames.map((frame) => frame.height))
  }

  console.log(
    `Grid ${config.gridCols}x${config.gridRows}, cell ${cellSize}x${cellSize}, uniform ${uniformCellWidth}x${uniformCellHeight} (${uniformMode}), excluding rows: ${[...excluded].map((r) => r + 1).join(', ') || 'none'}`,
  )

  for (const state of activeStates) {
    const manifest = await processGridState(
      config,
      state,
      sourcePath,
      cellSize,
      uniformCellWidth,
      uniformCellHeight,
      trimFrame,
    )

    const exportName =
      state.exportAs ??
      `${state.id.toUpperCase().replace(/-/g, '_')}_SPRITE_SHEET`
    exports.push({ name: exportName, manifest })
    stateSheetEntries.push({ id: state.id, exportName })
  }

  if (exports.length === 0) {
    throw new Error('No grid states were processed')
  }

  await writeGeneratedTsExports(exports, stateSheetEntries)
}

async function main(): Promise<void> {
  const gridConfigPath = path.join(ASSETS_DIR, 'grid.config.json')
  if (await fileExists(gridConfigPath)) {
    const rawGrid = await fs.readFile(gridConfigPath, 'utf8')
    const gridConfig = JSON.parse(rawGrid) as GridConfig
    await processCharacterGrid(gridConfig)
    return
  }

  const configPath = path.join(ASSETS_DIR, 'sheets.config.json')
  const rawConfig = await fs.readFile(configPath, 'utf8')
  const configs = JSON.parse(rawConfig) as SheetConfigEntry[]

  await fs.mkdir(OUT_DIR, { recursive: true })

  const manifests: Partial<Record<SheetConfigEntry['id'], SheetManifest>> = {}

  for (const config of configs) {
    const sourcePath = await resolveSourcePath(config)
    if (!sourcePath) {
      console.warn(`Skip ${config.id}: source file not found`)
      continue
    }

    manifests[config.id] = await processSheet(config, sourcePath)
  }

  if (!manifests.idle) {
    throw new Error('idle sheet is required but was not processed')
  }

  await writeGeneratedTs(manifests)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
