import type { SpriteAnimationState } from '../sprite/sprite-animation-system'
import type { SpiritMode } from '../../spirit-modes'
import { SPIRIT_DEFAULT_MODE } from '../../spirit-modes'

export interface SpiritBehaviorState {
  mode: SpiritMode
  stateElapsedMs: number
  x: number
  viewportWidth: number
  flipX: boolean
  /** 移动类动作到边后，等步态循环起点再回到 front-idle */
  pendingMode?: SpiritMode
  syncedPlayedFrameCount: number
}

export interface SpiritEntityState {
  animation: SpriteAnimationState
  behavior: SpiritBehaviorState
}

export const PATROL_EDGE_PADDING_PX = 8

export function createInitialBehaviorState(
  viewportWidth: number,
): SpiritBehaviorState {
  return {
    mode: SPIRIT_DEFAULT_MODE,
    stateElapsedMs: 0,
    x: PATROL_EDGE_PADDING_PX,
    viewportWidth,
    flipX: false,
    syncedPlayedFrameCount: 0,
  }
}

export function withViewportWidth(
  state: SpiritEntityState,
  viewportWidth: number,
): SpiritEntityState {
  if (state.behavior.viewportWidth === viewportWidth) return state
  return {
    ...state,
    behavior: { ...state.behavior, viewportWidth },
  }
}
