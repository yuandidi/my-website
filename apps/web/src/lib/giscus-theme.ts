import { getConfiguredSiteUrl } from '@lib/site-url'

export const GISCUS_ORIGIN = 'https://giscus.app'
export const GISCUS_IFRAME_SELECTOR = 'iframe.giscus-frame'

export const GISCUS_THEME_PATHS = {
  light: '/giscus-theme-light.css',
  dark: '/giscus-theme-dark.css',
} as const

export type GiscusColorMode = keyof typeof GISCUS_THEME_PATHS

export function getGiscusColorMode(): GiscusColorMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function resolveSiteOrigin(origin?: string): string {
  if (origin) {
    return origin.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return getConfiguredSiteUrl()
}

export function resolveGiscusThemeUrl(
  mode: GiscusColorMode,
  origin?: string,
): string {
  return `${resolveSiteOrigin(origin)}${GISCUS_THEME_PATHS[mode]}`
}

/** Optional absolute theme URL; built-in names are ignored in favor of site themes. */
export function getGiscusThemeOverride(): string | null {
  const theme = process.env.NEXT_PUBLIC_GISCUS_THEME?.trim()
  if (!theme) {
    return null
  }

  if (theme.startsWith('http://') || theme.startsWith('https://')) {
    return theme
  }

  if (theme.startsWith('/')) {
    return `${resolveSiteOrigin()}${theme}`
  }

  return null
}

export function buildGiscusSetConfigMessage(themeUrl: string) {
  return {
    giscus: {
      setConfig: {
        theme: themeUrl,
      },
    },
  } as const
}

export function applyGiscusTheme(
  mode: GiscusColorMode,
  origin?: string,
): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const iframe = document.querySelector<HTMLIFrameElement>(
    GISCUS_IFRAME_SELECTOR,
  )
  if (!iframe?.contentWindow) {
    return false
  }

  const themeUrl = getGiscusThemeOverride() ?? resolveGiscusThemeUrl(mode, origin)
  iframe.contentWindow.postMessage(
    buildGiscusSetConfigMessage(themeUrl),
    GISCUS_ORIGIN,
  )
  return true
}

export function resolveActiveGiscusThemeUrl(
  mode: GiscusColorMode,
  origin?: string,
): string {
  return getGiscusThemeOverride() ?? resolveGiscusThemeUrl(mode, origin)
}
