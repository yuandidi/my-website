import type { SpriteSheetConfig } from '../../sprite-config.types'
import type { GameSystem } from '../core/types'

export interface SpriteAnimationState {
  sheet: SpriteSheetConfig
  frameIndex: number
  frameTimeMs: number
  paused: boolean
  loop: boolean
  /** 定帧时不推进动画 */
  fixedFrameIndex?: number
  /** 进入当前 clip 后已播放的帧数（用于循环对齐） */
  playedFrameCount: number
}

export function getFrameDurationMs(sheet: SpriteSheetConfig): number {
  return 1000 / sheet.fps
}

export function getCompletedLoopCount(state: SpriteAnimationState): number {
  if (!state.loop || state.fixedFrameIndex !== undefined) return 0
  return Math.floor(state.playedFrameCount / state.sheet.frameCount)
}

export function createInitialAnimationState(
  sheet: SpriteSheetConfig,
  paused = false,
  loop = true,
  fixedFrameIndex?: number,
): SpriteAnimationState {
  return {
    sheet,
    frameIndex: fixedFrameIndex ?? 0,
    frameTimeMs: 0,
    paused,
    loop,
    fixedFrameIndex,
    playedFrameCount: 0,
  }
}

/** 非循环动画播完最后一帧（每推进一帧 playedFrameCount +1，播满即完成） */
export function isOneShotAnimationComplete(
  state: SpriteAnimationState,
): boolean {
  if (state.fixedFrameIndex !== undefined || state.loop) return false
  return state.playedFrameCount >= state.sheet.frameCount
}

/** 循环动画刚回到第 0 帧（步态对齐点） */
export function isAtLoopCycleStart(
  state: SpriteAnimationState,
  deltaMs: number,
): boolean {
  if (state.fixedFrameIndex !== undefined || !state.loop) return false
  return state.frameIndex === 0 && state.frameTimeMs <= deltaMs + 1
}

export function createSpriteAnimationSystem(): GameSystem<SpriteAnimationState> {
  return {
    update(state, tick) {
      if (state.paused || tick.deltaMs <= 0) return state
      if (state.fixedFrameIndex !== undefined) {
        if (state.frameIndex === state.fixedFrameIndex) return state
        return {
          ...state,
          frameIndex: state.fixedFrameIndex,
          frameTimeMs: 0,
          playedFrameCount: 0,
        }
      }

      const frameDurationMs = getFrameDurationMs(state.sheet)
      let frameTimeMs = state.frameTimeMs + tick.deltaMs
      let frameIndex = state.frameIndex
      let playedFrameCount = state.playedFrameCount ?? 0
      let advanced = false

      while (frameTimeMs >= frameDurationMs) {
        frameTimeMs -= frameDurationMs
        if (state.loop) {
          frameIndex = (frameIndex + 1) % state.sheet.frameCount
        } else if (frameIndex < state.sheet.frameCount - 1) {
          frameIndex += 1
        }
        playedFrameCount += 1
        advanced = true
      }

      if (!advanced && frameTimeMs === state.frameTimeMs) {
        return state
      }

      return {
        ...state,
        frameIndex,
        frameTimeMs,
        playedFrameCount,
      }
    },
  }
}
