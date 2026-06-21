import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
  query: vi.fn(),
}));

vi.mock('./analytics-store', () => ({
  getPostViewCountsBySlugs: vi.fn().mockResolvedValue(new Map()),
}));

import { query } from './db';
import {
  listPublishedPostSlugs,
  listPublishedPostsForFeed,
  searchPosts,
} from './blog';

describe('listPublishedPostsForFeed', () => {
  beforeEach(() => {
    vi.mocked(query).mockReset();
  });

  it('returns published posts ordered for RSS', async () => {
    vi.mocked(query).mockResolvedValue([
      {
        title: 'Hello',
        slug: 'hello',
        excerpt: 'Short intro',
        content: '# Full body',
        coverImage: 'https://example.com/cover.jpg',
        publishedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const posts = await listPublishedPostsForFeed({ limit: 10 });

    expect(posts).toEqual([
      {
        title: 'Hello',
        slug: 'hello',
        excerpt: 'Short intro',
        content: '# Full body',
        coverImage: 'https://example.com/cover.jpg',
        publishedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('FROM "Post" p'),
      [10],
    );
  });

  it('caps feed limit at 100', async () => {
    vi.mocked(query).mockResolvedValue([]);

    await listPublishedPostsForFeed({ limit: 500 });

    expect(query).toHaveBeenCalledWith(expect.any(String), [100]);
  });
});

describe('searchPosts', () => {
  beforeEach(() => {
    vi.mocked(query).mockReset();
  });

  it('searches title and excerpt with escaped pattern', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([
        {
          id: '1',
          title: 'Hello',
          slug: 'hello',
          excerpt: 'Intro',
          coverImage: null,
          publishedAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          tags: '[]',
        },
      ]);

    const result = await searchPosts({ q: '100%', page: 1, limit: 10 });

    expect(result.meta.total).toBe(1);
    expect(result.data[0]?.title).toBe('Hello');
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('ILIKE $1 ESCAPE'),
      ['%100\\%%'],
    );
  });
});

describe('listPublishedPostSlugs', () => {
  beforeEach(() => {
    vi.mocked(query).mockReset();
  });

  it('returns slug and updatedAt for sitemap', async () => {
    vi.mocked(query).mockResolvedValue([
      {
        slug: 'hello',
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
    ]);

    const entries = await listPublishedPostSlugs();

    expect(entries).toEqual([
      {
        slug: 'hello',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]);
  });
});
