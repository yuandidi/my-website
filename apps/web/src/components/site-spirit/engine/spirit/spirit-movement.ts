import type { SpriteSheetConfig } from '../../sprite-config.types'
import { SPIRIT_DEFAULT_MODE } from '../../spirit-modes'
import type { SpriteAnimationState } from '../sprite/sprite-animation-system'
import { getStridePerFrame } from '../sprite/sprite-metrics'
import type { SpiritBehaviorState } from './spirit-behavior-state'
import { PATROL_EDGE_PADDING_PX } from './spirit-behavior-state'
import type { ActionNode } from './spirit-fsm-config'

export interface PatrolBounds {
  minX: number
  maxX: number
}

export function getPatrolBounds(
  viewportWidth: number,
  displayWidth: number,
): PatrolBounds {
  const minX = PATROL_EDGE_PADDING_PX
  const maxX = Math.max(
    minX,
    viewportWidth - displayWidth - PATROL_EDGE_PADDING_PX,
  )
  return { minX, maxX }
}

export function applyWalkMovement(
  behavior: SpiritBehaviorState,
  animation: SpriteAnimationState,
  node: ActionNode,
  sheet: SpriteSheetConfig,
  bounds: PatrolBounds,
): SpiritBehaviorState {
  if (node.moveDirection === undefined) return behavior

  const framesAdvanced = Math.max(
    0,
    animation.playedFrameCount - behavior.syncedPlayedFrameCount,
  )
  if (framesAdvanced <= 0) return behavior

  const stridePerFrame = getStridePerFrame(sheet)
  return {
    ...behavior,
    x: Math.min(
      bounds.maxX,
      Math.max(
        bounds.minX,
        behavior.x + framesAdvanced * stridePerFrame * node.moveDirection,
      ),
    ),
    syncedPlayedFrameCount: animation.playedFrameCount,
  }
}

export function markEdgePending(
  behavior: SpiritBehaviorState,
  node: ActionNode,
  bounds: PatrolBounds,
): SpiritBehaviorState {
  if (!node.completeOnEdge || behavior.pendingMode) return behavior

  const atRightEdge =
    node.completeOnEdge === 'right' && behavior.x >= bounds.maxX - 0.5
  const atLeftEdge =
    node.completeOnEdge === 'left' && behavior.x <= bounds.minX + 0.5

  if (!atRightEdge && !atLeftEdge) return behavior
  return { ...behavior, pendingMode: SPIRIT_DEFAULT_MODE }
}
