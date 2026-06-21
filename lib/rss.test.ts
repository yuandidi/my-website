import { describe, expect, it } from 'vitest';
import { buildRssFeed } from './rss';

describe('buildRssFeed', () => {
  it('builds RSS 2.0 XML with channel and items', () => {
    const xml = buildRssFeed({
      siteUrl: 'https://dididi.space',
      siteTitle: 'Test Blog',
      siteDescription: 'A test feed',
      posts: [
        {
          title: 'First Post',
          slug: 'first-post',
          excerpt: 'Intro',
          content: 'Body',
          coverImage: null,
          publishedAt: '2026-01-15T08:00:00.000Z',
        },
      ],
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<title>Test Blog</title>');
    expect(xml).toContain('<link>https://dididi.space/blog</link>');
    expect(xml).toContain(
      '<atom:link href="https://dididi.space/feed.xml" rel="self"',
    );
    expect(xml).toContain('<title>First Post</title>');
    expect(xml).toContain(
      '<link>https://dididi.space/posts/first-post</link>',
    );
    expect(xml).toContain('<description>Intro</description>');
  });
});
