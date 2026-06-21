import { WEB_ROUTES } from '@my-blog/shared';
import type { FeedPost } from './blog';
import { buildPostDescription, escapeXml } from './seo';

export function buildRssFeed(options: {
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  posts: FeedPost[];
}): string {
  const { siteUrl, siteTitle, siteDescription, posts } = options;
  const feedUrl = `${siteUrl}${WEB_ROUTES.feed}`;
  const blogUrl = `${siteUrl}${WEB_ROUTES.blog}`;

  const items = posts
    .map((post) => {
      const link = `${siteUrl}${WEB_ROUTES.post(post.slug)}`;
      const description = escapeXml(buildPostDescription(post));
      const pubDate = new Date(post.publishedAt).toUTCString();

      let item = `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>`;

      if (post.coverImage) {
        item += `\n      <enclosure url="${escapeXml(post.coverImage)}" type="image/*" />`;
      }

      item += '\n    </item>';
      return item;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
