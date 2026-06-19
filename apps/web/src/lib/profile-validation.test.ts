import { describe, expect, it } from 'vitest'
import { validateUpdateProfileInput } from '@my-blog/shared'

describe('validateUpdateProfileInput', () => {
  it('accepts valid profile updates', () => {
    expect(() =>
      validateUpdateProfileInput({
        name: '迪迪',
        title: '开发者',
        avatarUrl: '/favicon.png',
        bio: 'hello',
        skills: ['React'],
        links: [{ label: 'GitHub', href: 'https://github.com/yuandidi' }],
      }),
    ).not.toThrow()
  })

  it('rejects invalid link href', () => {
    expect(() =>
      validateUpdateProfileInput({
        links: [{ label: 'Bad', href: 'javascript:alert(1)' }],
      }),
    ).toThrow(/http/)
  })

  it('rejects empty name', () => {
    expect(() =>
      validateUpdateProfileInput({
        name: '   ',
      }),
    ).toThrow(/name/)
  })
})
