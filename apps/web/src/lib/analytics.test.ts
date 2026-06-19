import { describe, expect, it } from 'vitest'
import {
  isPublicAnalyticsPath,
  validateTrackEventsPayload,
} from '@my-blog/shared'

describe('isPublicAnalyticsPath', () => {
  it('allows public pages', () => {
    expect(isPublicAnalyticsPath('/')).toBe(true)
    expect(isPublicAnalyticsPath('/blog')).toBe(true)
    expect(isPublicAnalyticsPath('/profile')).toBe(true)
    expect(isPublicAnalyticsPath('/posts/hello')).toBe(true)
    expect(isPublicAnalyticsPath('/tags/tech')).toBe(true)
  })

  it('blocks admin and profile edit routes', () => {
    expect(isPublicAnalyticsPath('/admin/analytics')).toBe(false)
    expect(isPublicAnalyticsPath('/admin/posts')).toBe(false)
    expect(isPublicAnalyticsPath('/profile/edit')).toBe(false)
  })
})

describe('validateTrackEventsPayload', () => {
  const sessionId = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts valid public events', () => {
    const payload = validateTrackEventsPayload({
      sessionId,
      events: [
        {
          event: 'page_view',
          path: '/blog',
          properties: { query: 'tag=tech' },
        },
      ],
    })

    expect(payload.events).toHaveLength(1)
    expect(payload.events[0]?.event).toBe('page_view')
  })

  it('rejects invalid session id', () => {
    expect(() =>
      validateTrackEventsPayload({
        sessionId: 'invalid',
        events: [{ event: 'page_view', path: '/blog' }],
      }),
    ).toThrow(/sessionId/)
  })

  it('rejects non-public paths', () => {
    expect(() =>
      validateTrackEventsPayload({
        sessionId,
        events: [{ event: 'page_view', path: '/admin/analytics' }],
      }),
    ).toThrow(/public page/)
  })
})
