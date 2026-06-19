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
})

describe('validateUpdatePostInput', () => {
  it('rejects empty content update', () => {
    expect(() =>
      validateUpdatePostInput({
        content: '   ',
      }),
    ).toThrow(/content/)
  })
})
