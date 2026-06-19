import { describe, expect, it } from 'vitest'
import {
  getHotspotHref,
  getRegionHotspots,
  WORLD_HOTSPOTS,
} from './world-map'

describe('world-map', () => {
  it('resolves hut hotspot to profile route', () => {
    const hut = WORLD_HOTSPOTS.find((spot) => spot.kind === 'hut')
    expect(hut).toBeDefined()
    expect(getHotspotHref(hut!)).toBe('/profile')
  })

  it('has no region hotspots until categories are configured', () => {
    expect(getRegionHotspots()).toEqual([])
  })

  it('keeps unique hotspot ids', () => {
    const ids = WORLD_HOTSPOTS.map((spot) => spot.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
