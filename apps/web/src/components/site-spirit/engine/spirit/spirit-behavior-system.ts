import { resolveSpiritVisual } from '../../spirit-visual-config'
import type { SpiritMode } from '../../spirit-modes'
import { SPIRIT_DEFAULT_MODE } from '../../spirit-modes'
import type { GameSystem } from '../core/types'
import {
  getCompletedLoopCount,
  isAtLoopCycleStart,
  isOneShotAnimationComplete,
  type SpriteAnimationState,
} from '../sprite/sprite-animation-system'
import { getSpriteDisplayWidth } from '../sprite/sprite-metrics'
import {
  type SpiritBehaviorState,
  type SpiritEntityState,
} from './spirit-behavior-state'
import {
  ACTION_STATES,
  HUB_STATE,
  isActionMode,
  pickRandomSpiritAction,
  resolveNextMode,
  type ActionNode,
} from './spirit-fsm-config'
import {
  applyWalkMovement,
  getPatrolBounds,
  markEdgePending,
} from './spirit-movement'

export type { SpiritBehaviorState, SpiritEntityState } from './spirit-behavior-state'
export {
  createInitialBehaviorState,
  PATROL_EDGE_PADDING_PX,
  withViewportWidth,
} from './spirit-behavior-state'
export {
  pickRandomSpiritAction,
  SPIRIT_ACTION_MODES,
  type SpiritActionMode,
} from './spirit-fsm-config'
export { getStridePerFrame } from '../sprite/sprite-metrics'

function syncAnimationToMode(
  animation: SpriteAnimationState,
  mode: SpiritMode,
): SpriteAnimationState {
  const visual = resolveSpiritVisual(mode)

  return {
    ...animation,
    sheet: visual.sheet,
    frameIndex: visual.fixedFrameIndex ?? 0,
    frameTimeMs: 0,
    loop: visual.loop,
    fixedFrameIndex: visual.fixedFrameIndex,
    playedFrameCount: 0,
  }
}

function transitionTo(
  behavior: SpiritBehaviorState,
  mode: SpiritMode,
): SpiritBehaviorState {
  return {
    ...behavior,
    mode,
    stateElapsedMs: 0,
    pendingMode: undefined,
    flipX: false,
    syncedPlayedFrameCount: 0,
  }
}

function shouldCompleteHub(behavior: SpiritBehaviorState): boolean {
  return behavior.stateElapsedMs >= HUB_STATE.advance.ms
}

function shouldCompleteAction(
  node: ActionNode,
  behavior: SpiritBehaviorState,
  animation: SpriteAnimationState,
  deltaMs: number,
): boolean {
  if (
    behavior.pendingMode === SPIRIT_DEFAULT_MODE &&
    isAtLoopCycleStart(animation, deltaMs)
  ) {
    return true
  }

  const { advance } = node

  if (advance.type === 'one-shot') {
    return isOneShotAnimationComplete(animation)
  }

  if (advance.type === 'loops') {
    return getCompletedLoopCount(animation) >= advance.count
  }

  return false
}

export function createSpiritBehaviorSystem(options?: {
  random?: () => number
}): GameSystem<SpiritEntityState> {
  const random = options?.random ?? Math.random

  return {
    update(entity, tick) {
      if (entity.animation.paused || tick.deltaMs <= 0) return entity

      let behavior: SpiritBehaviorState = {
        ...entity.behavior,
        stateElapsedMs: entity.behavior.stateElapsedMs + tick.deltaMs,
      }
      let animation = entity.animation
      const visual = resolveSpiritVisual(behavior.mode)
      const displayWidth = getSpriteDisplayWidth(visual.sheet)
      const bounds = getPatrolBounds(behavior.viewportWidth, displayWidth)

      if (isActionMode(behavior.mode)) {
        const node = ACTION_STATES[behavior.mode]

        behavior = applyWalkMovement(
          behavior,
          animation,
          node,
          visual.sheet,
          bounds,
        )
        behavior = markEdgePending(behavior, node, bounds)

        if (shouldCompleteAction(node, behavior, animation, tick.deltaMs)) {
          const nextMode = resolveNextMode(behavior.mode, random)
          behavior = transitionTo(behavior, nextMode)
          animation = syncAnimationToMode(animation, nextMode)
        }
      } else if (behavior.mode === SPIRIT_DEFAULT_MODE) {
        if (shouldCompleteHub(behavior)) {
          const nextMode = pickRandomSpiritAction(random)
          behavior = transitionTo(behavior, nextMode)
          animation = syncAnimationToMode(animation, nextMode)
        }
      } else if (behavior.mode === 'front-walk') {
        if (shouldCompleteHub(behavior)) {
          behavior = transitionTo(behavior, SPIRIT_DEFAULT_MODE)
          animation = syncAnimationToMode(animation, SPIRIT_DEFAULT_MODE)
        }
      }

      return { animation, behavior }
    },
  }
}
