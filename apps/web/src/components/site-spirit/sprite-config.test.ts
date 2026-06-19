import { describe, expect, it } from 'vitest'
import {
  FRONT_WALK_SPRITE_SHEET,
  getFrameMetrics,
  SPIRIT_STATE_SHEETS,
} from './sprite-config'
import {
  FRONT_IDLE_FRAME_INDEX,
  resolveSpiritVisual,
} from './spirit-visual-config'

describe('sprite-config', () => {
  it('derives frame metrics from front walk sheet', () => {
    const { frameWidth, displayHeight } = getFrameMetrics(FRONT_WALK_SPRITE_SHEET)
    expect(frameWidth).toBeGreaterThan(0)
    expect(displayHeight).toBe(88)
  })

  it('uses eight front walk frames at 8fps', () => {
    expect(FRONT_WALK_SPRITE_SHEET.frameCount).toBe(8)
    expect(FRONT_WALK_SPRITE_SHEET.fps).toBe(8)
  })

  it('registers six sprite sheet states', () => {
    expect(Object.keys(SPIRIT_STATE_SHEETS)).toEqual([
      'front-walk',
      'walk-right-staff',
      'walk-back',
      'cast-left',
      'knockdown',
      'walk-left',
    ])
  })
})

describe('spirit-visual-config', () => {
  it('uses front-walk frame 2 as front-idle', () => {
    const visual = resolveSpiritVisual('front-idle')
    expect(visual.sheet).toBe(FRONT_WALK_SPRITE_SHEET)
    expect(visual.fixedFrameIndex).toBe(FRONT_IDLE_FRAME_INDEX)
    expect(FRONT_IDLE_FRAME_INDEX).toBe(1)
    expect(visual.loop).toBe(false)
  })
})
