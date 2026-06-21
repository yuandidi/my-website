import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./db', () => ({
  query: vi.fn(),
}));

import { query } from './db';
import {
  listPublishedPostSlugs,
  listPublishedPostsForFeed,
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
