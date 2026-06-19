'use client'

import {
  API_ROUTES,
  isPublicAnalyticsPath,
  type AnalyticsEventInput,
  type AnalyticsEventName,
  type AnalyticsEventProperties,
} from '@my-blog/shared'

const SESSION_STORAGE_KEY = 'analytics_session_id'
const FLUSH_DELAY_MS = 1500

const isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false'

let flushTimer: ReturnType<typeof setTimeout> | undefined
const queue: AnalyticsEventInput[] = []

function getSessionId() {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const created = crypto.randomUUID()
  window.localStorage.setItem(SESSION_STORAGE_KEY, created)
  return created
}

function scheduleFlush() {
  if (flushTimer) {
    clearTimeout(flushTimer)
  }

  flushTimer = setTimeout(() => {
    void flushAnalyticsQueue()
  }, FLUSH_DELAY_MS)
}

async function flushAnalyticsQueue() {
  if (!isEnabled || queue.length === 0) {
    return
  }

  const events = queue.splice(0, queue.length)
  const sessionId = getSessionId()

  if (!sessionId) {
    return
  }

  const payload = JSON.stringify({ sessionId, events })
  const url = `/api${API_ROUTES.analyticsEvents}`

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    if (navigator.sendBeacon(url, blob)) {
      return
    }
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    queue.unshift(...events)
  }
}

export function track(
  event: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
  path?: string,
) {
  if (!isEnabled || typeof window === 'undefined') {
    return
  }

  const currentPath = path ?? window.location.pathname
  if (!isPublicAnalyticsPath(currentPath)) {
    return
  }

  queue.push({
    event,
    path: currentPath,
    properties,
  })

  scheduleFlush()
}

export function flushAnalytics() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = undefined
  }

  return flushAnalyticsQueue()
}

export { isPublicAnalyticsPath }

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    void flushAnalyticsQueue()
  })

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      void flushAnalyticsQueue()
    }
  })
}
