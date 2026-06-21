import { listPublishedPostsForFeed } from '@lib/blog';
import { buildRssFeed } from '@lib/rss';
import { SITE_DESCRIPTION, SITE_NAME } from '@lib/seo';
import { getConfiguredSiteUrl } from '@lib/site-url';

export const revalidate = 3600;

export async function GET() {
  const posts = await listPublishedPostsForFeed();
  const siteUrl = getConfiguredSiteUrl();

  const xml = buildRssFeed({
    siteUrl,
    siteTitle: SITE_NAME,
    siteDescription: SITE_DESCRIPTION,
    posts,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
