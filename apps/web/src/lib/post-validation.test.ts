import { describe, expect, it } from 'vitest'
import {
  validateCreatePostInput,
  validateUpdatePostInput,
} from '@my-blog/shared'

describe('validateCreatePostInput', () => {
  it('accepts valid post input', () => {
    expect(() =>
      validateCreatePostInput({
        title: 'Hello World',
        content: '# Hello',
        status: 'DRAFT',
      }),
    ).not.toThrow()
  })

  it('rejects empty title', () => {
    expect(() =>
      validateCreatePostInput({
        title: '   ',
        content: 'content',
      }),
    ).toThrow(/title/)
  })

  it('rejects invalid slug', () => {
    expect(() =>
      validateCreatePostInput({
        title: 'Hello',
        slug: 'Bad Slug',
        content: 'content',
      }),
    ).toThrow(/slug/)
  })

  it('accepts Chinese slug', () => {
    expect(() =>
      validateCreatePostInput({
        title: '第一篇',
        slug: '第一篇blog',
        content: 'content',
      }),
    ).not.toThrow()
  })
})

describe('validateUpdatePostInput', () => {
  it('accepts Chinese slug on update', () => {
    expect(() =>
      validateUpdatePostInput({
        slug: '第一篇blog',
      }),
    ).not.toThrow()
  })

  it('rejects empty content update', () => {
    expect(() =>
      validateUpdatePostInput({
        content: '   ',
      }),
    ).toThrow(/content/)
  })
})
