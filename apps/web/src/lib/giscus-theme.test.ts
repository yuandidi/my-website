import { afterEach, describe, expect, it } from 'vitest'
import {
  buildGiscusSetConfigMessage,
  getGiscusThemeOverride,
  resolveActiveGiscusThemeUrl,
  resolveGiscusThemeUrl,
  resolveSiteOrigin,
} from './giscus-theme'

describe('resolveGiscusThemeUrl', () => {
  it('builds absolute theme URLs from origin and mode', () => {
    expect(resolveGiscusThemeUrl('light', 'https://dididi.space')).toBe(
      'https://dididi.space/giscus-theme-light.css',
    )
    expect(resolveGiscusThemeUrl('dark', 'https://dididi.space')).toBe(
      'https://dididi.space/giscus-theme-dark.css',
    )
  })
})

describe('resolveSiteOrigin', () => {
  it('strips trailing slash from configured origin', () => {
    expect(resolveSiteOrigin('https://dididi.space/')).toBe(
      'https://dididi.space',
    )
  })
})

describe('getGiscusThemeOverride', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GISCUS_THEME
    delete process.env.SITE_URL
  })

  it('returns null for built-in theme names', () => {
    process.env.NEXT_PUBLIC_GISCUS_THEME = 'preferred_color_scheme'
    expect(getGiscusThemeOverride()).toBeNull()
  })

  it('returns absolute URLs when configured', () => {
    process.env.NEXT_PUBLIC_GISCUS_THEME =
      'https://example.com/custom-giscus.css'
    expect(getGiscusThemeOverride()).toBe(
      'https://example.com/custom-giscus.css',
    )
  })

  it('resolves root-relative override URLs against site origin', () => {
    process.env.NEXT_PUBLIC_GISCUS_THEME = '/custom-giscus.css'
    process.env.SITE_URL = 'https://dididi.space'
    expect(getGiscusThemeOverride()).toBe(
      'https://dididi.space/custom-giscus.css',
    )
  })
})

describe('resolveActiveGiscusThemeUrl', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GISCUS_THEME
  })

  it('prefers override URL over built-in fantasy themes', () => {
    process.env.NEXT_PUBLIC_GISCUS_THEME =
      'https://example.com/custom-giscus.css'
    expect(resolveActiveGiscusThemeUrl('dark', 'https://dididi.space')).toBe(
      'https://example.com/custom-giscus.css',
    )
  })
})

describe('buildGiscusSetConfigMessage', () => {
  it('wraps theme URL for postMessage', () => {
    expect(
      buildGiscusSetConfigMessage('https://dididi.space/giscus-theme-dark.css'),
    ).toEqual({
      giscus: {
        setConfig: {
          theme: 'https://dididi.space/giscus-theme-dark.css',
        },
      },
    })
  })
})
