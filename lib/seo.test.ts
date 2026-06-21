import { describe, expect, it } from 'vitest';
import { buildRssFeed } from './rss';
import {
  buildPostDescription,
  escapeXml,
  stripMarkdown,
  truncateText,
} from './seo';

describe('stripMarkdown', () => {
  it('removes markdown syntax and collapses whitespace', () => {
    expect(stripMarkdown('# Title\n\nHello [world](https://example.com)')).toBe(
      'Title Hello world',
    );
  });
});

describe('truncateText', () => {
  it('appends ellipsis when text exceeds max length', () => {
    expect(truncateText('abcdefghij', 6)).toBe('abcde…');
  });
});

describe('escapeXml', () => {
  it('escapes reserved XML characters', () => {
    expect(escapeXml(`Tom & Jerry "quote"`)).toBe(
      'Tom &amp; Jerry &quot;quote&quot;',
    );
  });
});

describe('buildPostDescription', () => {
  it('prefers excerpt over stripped content', () => {
    expect(
      buildPostDescription({
        excerpt: 'From excerpt',
        content: '# Ignored',
      }),
    ).toBe('From excerpt');
  });
});
