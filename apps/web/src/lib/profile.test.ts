import { describe, expect, it } from 'vitest'
import { SITE_PROFILE_FALLBACK } from './profile'

describe('profile fallback', () => {
  it('defines required identity fields', () => {
    expect(SITE_PROFILE_FALLBACK.name).toBeTruthy()
    expect(SITE_PROFILE_FALLBACK.title).toBeTruthy()
    expect(SITE_PROFILE_FALLBACK.avatarUrl).toBeTruthy()
    expect(SITE_PROFILE_FALLBACK.bio).toBeTruthy()
  })

  it('uses safe external link attributes target', () => {
    for (const link of SITE_PROFILE_FALLBACK.links) {
      expect(link.href).toMatch(/^https?:\/\//)
      expect(link.label).toBeTruthy()
    }
  })
})
