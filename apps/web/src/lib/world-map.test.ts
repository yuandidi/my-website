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

  it('resolves region hotspots to category routes', () => {
    for (const region of getRegionHotspots()) {
      expect(getHotspotHref(region)).toBe(`/categories/${region.slug}`)
    }
  })

  it('keeps unique hotspot ids', () => {
    const ids = WORLD_HOTSPOTS.map((spot) => spot.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('maps seed category slugs on the world map', () => {
    const slugs = getRegionHotspots().map((region) => region.slug)
    expect(slugs).toEqual(expect.arrayContaining(['tech', 'life', 'notes']))
  })
})
