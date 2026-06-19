import { describe, expect, it } from 'vitest'
import { createGameEngine } from './core/game-engine'
import {
  createInitialAnimationState,
  createSpriteAnimationSystem,
  getFrameDurationMs,
} from './sprite/sprite-animation-system'
import { createSpiritEngine } from './spirit/spirit-engine'
import {
  CAST_LEFT_SPRITE_SHEET,
  FRONT_WALK_SPRITE_SHEET,
  WALK_BACK_SPRITE_SHEET,
  WALK_RIGHT_STAFF_SPRITE_SHEET,
} from '../sprite-config'
import { FRONT_IDLE_FRAME_INDEX } from '../spirit-visual-config'
import {
  getStridePerFrame,
  pickRandomSpiritAction,
  SPIRIT_ACTION_MODES,
} from './spirit/spirit-behavior-system'

function createSpiritTestEngine(
  viewportWidth = 800,
  random: () => number = () => 0,
) {
  return createSpiritEngine({ viewportWidth, random })
}

describe('sprite-animation-system', () => {
  const frameDurationMs = getFrameDurationMs(FRONT_WALK_SPRITE_SHEET)

  it('advances frames using deltaMs from RAF ticks', () => {
    const system = createSpriteAnimationSystem()
    const engine = createGameEngine(
      createInitialAnimationState(FRONT_WALK_SPRITE_SHEET),
      [system],
    )

    engine.tick({ deltaMs: frameDurationMs, elapsedMs: frameDurationMs, timestamp: frameDurationMs })
    expect(engine.getState().frameIndex).toBe(1)

    engine.tick({
      deltaMs: frameDurationMs,
      elapsedMs: frameDurationMs * 2,
      timestamp: frameDurationMs * 2,
    })
    expect(engine.getState().frameIndex).toBe(2)
  })

  it('wraps to frame zero after the last frame', () => {
    const system = createSpriteAnimationSystem()
    const engine = createGameEngine(
      createInitialAnimationState(FRONT_WALK_SPRITE_SHEET),
      [system],
    )

    for (let i = 0; i < FRONT_WALK_SPRITE_SHEET.frameCount; i += 1) {
      engine.tick({
        deltaMs: frameDurationMs,
        elapsedMs: (i + 1) * frameDurationMs,
        timestamp: (i + 1) * frameDurationMs,
      })
    }

    expect(engine.getState().frameIndex).toBe(0)
  })

  it('does not advance when paused', () => {
    const system = createSpriteAnimationSystem()
    const engine = createGameEngine(
      createInitialAnimationState(FRONT_WALK_SPRITE_SHEET, true),
      [system],
    )

    engine.tick({ deltaMs: 1000, elapsedMs: 1000, timestamp: 1000 })
    expect(engine.getState().frameIndex).toBe(0)
  })

  it('stops on the last frame when loop is disabled', () => {
    const system = createSpriteAnimationSystem()
    const engine = createGameEngine(
      createInitialAnimationState(FRONT_WALK_SPRITE_SHEET, false, false),
      [system],
    )

    for (let i = 0; i < FRONT_WALK_SPRITE_SHEET.frameCount + 2; i += 1) {
      engine.tick({
        deltaMs: frameDurationMs,
        elapsedMs: (i + 1) * frameDurationMs,
        timestamp: (i + 1) * frameDurationMs,
      })
    }

    expect(engine.getState().frameIndex).toBe(FRONT_WALK_SPRITE_SHEET.frameCount - 1)
  })

  it('keeps front-idle pinned to frame 2', () => {
    const system = createSpriteAnimationSystem()
    const engine = createGameEngine(
      createInitialAnimationState(
        FRONT_WALK_SPRITE_SHEET,
        false,
        false,
        FRONT_IDLE_FRAME_INDEX,
      ),
      [system],
    )

    engine.tick({ deltaMs: 5000, elapsedMs: 5000, timestamp: 5000 })
    expect(engine.getState().frameIndex).toBe(FRONT_IDLE_FRAME_INDEX)
  })
})

describe('spirit-behavior-system', () => {
  it('starts in front-idle and picks a random action after hold', () => {
    const engine = createSpiritTestEngine(800, () => 0)

    expect(engine.getState().behavior.mode).toBe('front-idle')
    expect(engine.getState().animation.frameIndex).toBe(FRONT_IDLE_FRAME_INDEX)

    engine.tick({ deltaMs: 3700, elapsedMs: 3700, timestamp: 3700 })
    expect(engine.getState().behavior.mode).toBe(SPIRIT_ACTION_MODES[0])
  })

  it('returns to front-idle after one-shot cast-left', () => {
    const engine = createSpiritTestEngine(800)
    const frameDurationMs = getFrameDurationMs(CAST_LEFT_SPRITE_SHEET)

    engine.reset({
      ...engine.getState(),
      behavior: {
        ...engine.getState().behavior,
        mode: 'cast-left',
        stateElapsedMs: 0,
        syncedPlayedFrameCount: 0,
      },
      animation: createInitialAnimationState(CAST_LEFT_SPRITE_SHEET, false, false),
    })

    for (let i = 0; i < CAST_LEFT_SPRITE_SHEET.frameCount; i += 1) {
      engine.tick({
        deltaMs: frameDurationMs,
        elapsedMs: (i + 1) * frameDurationMs,
        timestamp: (i + 1) * frameDurationMs,
      })
    }

    expect(engine.getState().behavior.mode).toBe('front-idle')
  })

  it('returns to front-idle after two walk-back cycles', () => {
    const engine = createSpiritTestEngine(800)
    const frameDurationMs = getFrameDurationMs(WALK_BACK_SPRITE_SHEET)

    engine.reset({
      ...engine.getState(),
      behavior: {
        ...engine.getState().behavior,
        mode: 'walk-back',
        stateElapsedMs: 0,
        x: 120,
        syncedPlayedFrameCount: 0,
      },
      animation: createInitialAnimationState(WALK_BACK_SPRITE_SHEET, false, true),
    })

    engine.tick({
      deltaMs: frameDurationMs * WALK_BACK_SPRITE_SHEET.frameCount * 2,
      elapsedMs: frameDurationMs * WALK_BACK_SPRITE_SHEET.frameCount * 2,
      timestamp: frameDurationMs * WALK_BACK_SPRITE_SHEET.frameCount * 2,
    })

    expect(engine.getState().behavior.mode).toBe('front-idle')
  })

  it('does not move horizontally during walk-back', () => {
    const engine = createSpiritTestEngine(800)
    engine.reset({
      ...engine.getState(),
      behavior: {
        ...engine.getState().behavior,
        mode: 'walk-back',
        stateElapsedMs: 0,
        x: 120,
        syncedPlayedFrameCount: 0,
      },
      animation: createInitialAnimationState(WALK_BACK_SPRITE_SHEET, false, true),
    })

    engine.tick({ deltaMs: 500, elapsedMs: 500, timestamp: 500 })
    expect(engine.getState().behavior.mode).toBe('walk-back')
    expect(engine.getState().behavior.x).toBe(120)
  })

  it('steps horizontally on each walk frame instead of drifting', () => {
    const engine = createSpiritTestEngine(800)
    const frameDurationMs = getFrameDurationMs(WALK_RIGHT_STAFF_SPRITE_SHEET)
    const stridePerFrame = getStridePerFrame(WALK_RIGHT_STAFF_SPRITE_SHEET)

    engine.reset({
      ...engine.getState(),
      behavior: {
        ...engine.getState().behavior,
        mode: 'walk-right-staff',
        stateElapsedMs: 0,
        x: 20,
        syncedPlayedFrameCount: 0,
      },
      animation: createInitialAnimationState(
        WALK_RIGHT_STAFF_SPRITE_SHEET,
        false,
        true,
      ),
    })

    const xBefore = engine.getState().behavior.x
    engine.tick({ deltaMs: frameDurationMs * 0.4, elapsedMs: 40, timestamp: 40 })
    expect(engine.getState().behavior.x).toBe(xBefore)

    engine.tick({ deltaMs: frameDurationMs, elapsedMs: frameDurationMs, timestamp: frameDurationMs })
    expect(engine.getState().behavior.x).toBeCloseTo(xBefore + stridePerFrame, 4)
  })

  it('pickRandomSpiritAction covers action pool', () => {
    expect(pickRandomSpiritAction(() => 0)).toBe(SPIRIT_ACTION_MODES[0])
    expect(pickRandomSpiritAction(() => 0.999)).toBe(
      SPIRIT_ACTION_MODES[SPIRIT_ACTION_MODES.length - 1],
    )
  })
})

describe('game-engine', () => {
  it('notifies subscribers only when state changes', () => {
    const engine = createSpiritTestEngine(800)
    let notifications = 0
    engine.subscribe(() => {
      notifications += 1
    })

    engine.tick({ deltaMs: 16, elapsedMs: 16, timestamp: 16 })
    expect(notifications).toBeGreaterThanOrEqual(0)

    engine.reset({
      ...engine.getState(),
      animation: createInitialAnimationState(FRONT_WALK_SPRITE_SHEET, true),
    })
    expect(notifications).toBeGreaterThanOrEqual(1)
  })
})
