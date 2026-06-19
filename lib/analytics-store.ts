import { randomUUID } from 'node:crypto';
import type {
  AnalyticsEventInput,
  AnalyticsSummary,
  TrackEventsPayload,
} from '@my-blog/shared';
import { query } from './db';

interface DailyRow {
  date: string;
  page_views: string;
  unique_sessions: string;
}

interface CountRow {
  path?: string;
  slug?: string;
  href?: string;
  label?: string;
  views?: string;
  clicks?: string;
}

interface TotalRow {
  page_views: string;
  unique_sessions: string;
  post_views: string;
}

export async function getPostViewCountsBySlugs(
  slugs: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  for (const slug of slugs) {
    counts.set(slug, 0);
  }

  if (slugs.length === 0) {
    return counts;
  }

  const rows = await query<{ slug: string; views: string }>(
    `
      SELECT "properties"->>'slug' AS slug, COUNT(*)::text AS views
      FROM "AnalyticsEvent"
      WHERE "event" = 'post_view'
        AND "properties"->>'slug' = ANY($1::text[])
      GROUP BY 1
    `,
    [slugs],
  );

  for (const row of rows) {
    if (row.slug) {
      counts.set(row.slug, Number(row.views));
    }
  }

  return counts;
}

export async function insertAnalyticsEvents(payload: TrackEventsPayload) {
  const { sessionId, events } = payload;

  if (events.length === 0) {
    return;
  }

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let index = 1;

  for (const event of events) {
    placeholders.push(
      `($${index}, $${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`,
    );
    values.push(
      randomUUID(),
      event.event,
      event.path,
      JSON.stringify(event.properties ?? {}),
      sessionId,
    );
    index += 5;
  }

  await query(
    `
      INSERT INTO "AnalyticsEvent" ("id", "event", "path", "properties", "sessionId")
      VALUES ${placeholders.join(', ')}
    `,
    values,
  );
}

function clampDays(days: number) {
  if (!Number.isFinite(days) || days < 1) {
    return 7;
  }

  return Math.min(Math.floor(days), 90);
}

export async function getAnalyticsSummary(daysInput: number): Promise<AnalyticsSummary> {
  const days = clampDays(daysInput);

  const [totals] = await query<TotalRow>(
    `
      SELECT
        COUNT(*) FILTER (WHERE "event" = 'page_view')::text AS page_views,
        COUNT(DISTINCT "sessionId")::text AS unique_sessions,
        COUNT(*) FILTER (WHERE "event" = 'post_view')::text AS post_views
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
    `,
    [days],
  );

  const daily = await query<DailyRow>(
    `
      SELECT
        TO_CHAR(DATE("createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS date,
        COUNT(*) FILTER (WHERE "event" = 'page_view')::text AS page_views,
        COUNT(DISTINCT "sessionId")::text AS unique_sessions
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    [days],
  );

  const topPages = await query<CountRow>(
    `
      SELECT "path", COUNT(*)::text AS views
      FROM "AnalyticsEvent"
      WHERE "event" = 'page_view'
        AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
      GROUP BY "path"
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
    [days],
  );

  const topPosts = await query<CountRow>(
    `
      SELECT "properties"->>'slug' AS slug, COUNT(*)::text AS views
      FROM "AnalyticsEvent"
      WHERE "event" = 'post_view'
        AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
        AND COALESCE("properties"->>'slug', '') <> ''
      GROUP BY 1
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
    [days],
  );

  const topTagFilters = await query<CountRow>(
    `
      SELECT "properties"->>'slug' AS slug, COUNT(*)::text AS clicks
      FROM "AnalyticsEvent"
      WHERE "event" = 'tag_filter'
        AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
        AND COALESCE("properties"->>'slug', '') <> ''
      GROUP BY 1
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
    [days],
  );

  const topExternalLinks = await query<CountRow>(
    `
      SELECT
        "properties"->>'href' AS href,
        COALESCE("properties"->>'label', '') AS label,
        COUNT(*)::text AS clicks
      FROM "AnalyticsEvent"
      WHERE "event" = 'external_link_click'
        AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
        AND COALESCE("properties"->>'href', '') <> ''
      GROUP BY 1, 2
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `,
    [days],
  );

  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  from.setUTCHours(0, 0, 0, 0);

  return {
    period: {
      days,
      from: from.toISOString(),
      to: to.toISOString(),
    },
    totals: {
      pageViews: Number(totals?.page_views ?? 0),
      uniqueSessions: Number(totals?.unique_sessions ?? 0),
      postViews: Number(totals?.post_views ?? 0),
    },
    daily: daily.map((row) => ({
      date: row.date,
      pageViews: Number(row.page_views),
      uniqueSessions: Number(row.unique_sessions),
    })),
    topPages: topPages
      .filter((row) => row.path)
      .map((row) => ({
        path: String(row.path),
        views: Number(row.views ?? 0),
      })),
    topPosts: topPosts
      .filter((row) => row.slug)
      .map((row) => ({
        slug: String(row.slug),
        views: Number(row.views ?? 0),
      })),
    topTagFilters: topTagFilters
      .filter((row) => row.slug)
      .map((row) => ({
        slug: String(row.slug),
        clicks: Number(row.clicks ?? 0),
      })),
    topExternalLinks: topExternalLinks
      .filter((row) => row.href)
      .map((row) => ({
        href: String(row.href),
        label: String(row.label ?? ''),
        clicks: Number(row.clicks ?? 0),
      })),
  };
}

export type { AnalyticsEventInput };
