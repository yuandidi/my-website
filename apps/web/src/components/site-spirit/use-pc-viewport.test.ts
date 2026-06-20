import { describe, expect, it, vi, afterEach } from 'vitest'
import { matchesPcViewport, PC_VIEWPORT_MEDIA_QUERY } from './use-pc-viewport'

describe('matchesPcViewport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses hover + fine pointer + min-width query', () => {
    expect(PC_VIEWPORT_MEDIA_QUERY).toBe(
      '(min-width: 768px) and (hover: hover) and (pointer: fine)',
    )
  })

  it('returns false when window is unavailable', () => {
    expect(matchesPcViewport()).toBe(false)
  })

  it('returns matchMedia result in browser', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => {
        expect(query).toBe(PC_VIEWPORT_MEDIA_QUERY)
        return { matches: true }
      },
    })

    expect(matchesPcViewport()).toBe(true)
  })
})
