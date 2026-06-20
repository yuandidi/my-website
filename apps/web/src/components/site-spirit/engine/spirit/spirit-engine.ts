import {
  createInitialBehaviorState,
  createSpiritBehaviorSystem,
  type SpiritEntityState,
  withViewportWidth,
} from './spirit-behavior-system'
import {
  createInitialAnimationState,
  createSpriteAnimationSystem,
} from '../sprite/sprite-animation-system'
import { createGameEngine } from '../core/game-engine'
import { SPIRIT_DEFAULT_MODE } from '../../spirit-modes'
import { resolveSpiritVisual } from '../../spirit-visual-config'
import type { FrameTick, GameEngine } from '../core/types'

export type { SpiritEntityState, SpiritBehaviorState } from './spirit-behavior-system'

export interface SpiritEngine extends GameEngine<SpiritEntityState> {
  tick(input: FrameTick): void
  updateViewport(width: number): void
}

export function createSpiritEngine(options?: {
  paused?: boolean
  viewportWidth?: number
  /** 可注入随机源，便于测试 */
  random?: () => number
}): SpiritEngine {
  const viewportWidth = options?.viewportWidth ?? 1024
  const initialVisual = resolveSpiritVisual(SPIRIT_DEFAULT_MODE)
  const initialState: SpiritEntityState = {
    behavior: createInitialBehaviorState(viewportWidth),
    animation: createInitialAnimationState(
      initialVisual.sheet,
      options?.paused ?? false,
      initialVisual.loop,
      initialVisual.fixedFrameIndex,
    ),
  }

  const animationSystem = createSpriteAnimationSystem()
  const behaviorSystem = createSpiritBehaviorSystem({
    random: options?.random,
  })

  const engine = createGameEngine(initialState, [
    {
      update(entity, tick) {
        const nextAnimation = animationSystem.update(entity.animation, tick)
        const nextEntity: SpiritEntityState =
          nextAnimation === entity.animation
            ? entity
            : { ...entity, animation: nextAnimation }

        return behaviorSystem.update(nextEntity, tick)
      },
    },
  ])

  return {
    ...engine,
    updateViewport(width: number) {
      const next = withViewportWidth(engine.getState(), width)
      if (next === engine.getState()) return
      engine.reset(next)
    },
  }
}
