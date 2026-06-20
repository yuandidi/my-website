import { describe, expect, it } from 'vitest'
import { FRONT_WALK_SPRITE_SHEET } from '../../sprite-config'
import { getSpriteSourceRect } from './sprite-canvas-renderer'

describe('sprite-canvas-renderer', () => {
  it('maps frame index to sheet source rect', () => {
    expect(getSpriteSourceRect(FRONT_WALK_SPRITE_SHEET, 0)).toEqual({
      sx: 0,
      sy: 0,
      sw: 128,
      sh: 128,
    })
    expect(getSpriteSourceRect(FRONT_WALK_SPRITE_SHEET, 1)).toEqual({
      sx: 128,
      sy: 0,
      sw: 128,
      sh: 128,
    })
  })
})
