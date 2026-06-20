import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
  query: vi.fn(),
}));

import { query } from './db';
import { createPost, deletePost, slugifyName } from './post-store';

describe('slugifyName', () => {
  it('slugifies English titles', () => {
    expect(slugifyName('Hello World')).toBe('hello-world');
  });

  it('preserves Chinese characters', () => {
    expect(slugifyName('第一篇博客')).toBe('第一篇博客');
  });

  it('falls back when slug is empty', () => {
    expect(slugifyName('---')).toBe('item');
  });
});

describe('createPost', () => {
  beforeEach(() => {
    vi.mocked(query).mockReset();
  });

  it('rejects invalid input before querying the database', async () => {
    await expect(
      createPost({ title: '   ', content: 'content' }),
    ).rejects.toThrow(/title/);
    expect(query).not.toHaveBeenCalled();
  });
});

describe('deletePost', () => {
  beforeEach(() => {
    vi.mocked(query).mockReset();
  });

  it('throws not found when post does not exist', async () => {
    vi.mocked(query).mockResolvedValue([]);

    await expect(deletePost('missing-slug')).rejects.toThrow(/not found/);
  });
});
