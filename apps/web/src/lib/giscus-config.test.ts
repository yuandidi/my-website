import { afterEach, describe, expect, it } from 'vitest'
import { getGiscusConfig, isGiscusEnabled } from './giscus-config'

const ENV_KEYS = [
  'NEXT_PUBLIC_GISCUS_REPO',
  'NEXT_PUBLIC_GISCUS_REPO_ID',
  'NEXT_PUBLIC_GISCUS_CATEGORY',
  'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
  'NEXT_PUBLIC_GISCUS_THEME',
] as const

function clearGiscusEnv() {
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
}

describe('getGiscusConfig', () => {
  afterEach(() => {
    clearGiscusEnv()
  })

  it('returns null when required env vars are missing', () => {
    expect(getGiscusConfig()).toBeNull()
    expect(isGiscusEnabled()).toBe(false)
  })

  it('returns config when required env vars are set', () => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = 'yuandidi/my-blog-comments'
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'R_kgDOExample'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'DIC_kwDOExample'

    expect(getGiscusConfig()).toEqual({
      repo: 'yuandidi/my-blog-comments',
      repoId: 'R_kgDOExample',
      category: 'General',
      categoryId: 'DIC_kwDOExample',
      theme: 'preferred_color_scheme',
    })
    expect(isGiscusEnabled()).toBe(true)
  })

  it('uses custom category and theme when provided', () => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = 'yuandidi/my-blog-comments'
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'R_kgDOExample'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY = 'Blog Comments'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'DIC_kwDOExample'
    process.env.NEXT_PUBLIC_GISCUS_THEME = 'transparent_dark'

    expect(getGiscusConfig()).toMatchObject({
      category: 'Blog Comments',
      theme: 'transparent_dark',
    })
  })
})
