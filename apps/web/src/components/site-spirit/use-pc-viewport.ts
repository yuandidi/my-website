import { useSyncExternalStore } from 'react'

/** 有鼠标悬停 + 精细指针 + 足够宽度，视为 PC 端 */
export const PC_VIEWPORT_MEDIA_QUERY =
  '(min-width: 768px) and (hover: hover) and (pointer: fine)'

export function matchesPcViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(PC_VIEWPORT_MEDIA_QUERY).matches
}

function subscribePcViewport(onStoreChange: () => void) {
  const media = window.matchMedia(PC_VIEWPORT_MEDIA_QUERY)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

export function usePcViewport() {
  return useSyncExternalStore(
    subscribePcViewport,
    matchesPcViewport,
    () => false,
  )
}
