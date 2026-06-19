import { describe, expect, it } from 'vitest'
import { SITE_PROFILE } from './profile'

describe('profile', () => {
  it('defines required identity fields', () => {
    expect(SITE_PROFILE.name).toBeTruthy()
    expect(SITE_PROFILE.title).toBeTruthy()
    expect(SITE_PROFILE.avatar).toBeTruthy()
    expect(SITE_PROFILE.bio).toBeTruthy()
  })

  it('keeps featured post slugs unique', () => {
    const slugs = SITE_PROFILE.featuredPosts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses safe external link attributes target', () => {
    for (const link of SITE_PROFILE.links) {
      expect(link.href).toMatch(/^https?:\/\//)
      expect(link.label).toBeTruthy()
    }
  })
})
