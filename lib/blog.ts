import type {
  PaginatedResponse,
  PostDetail,
  PostSummary,
  Tag,
} from '@my-blog/shared';
import { getPostViewCountsBySlugs } from './analytics-store';
import { query } from './db';

function mapTags(value: unknown): Tag[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return JSON.parse(value) as Tag[];
  }
  return value as Tag[];
}

function mapPostSummary(row: Record<string, unknown>): PostSummary {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    coverImage: row.coverImage ? String(row.coverImage) : null,
    viewCount: 0,
    publishedAt: row.publishedAt
      ? new Date(String(row.publishedAt)).toISOString()
      : null,
    tags: mapTags(row.tags),
  };
}

async function attachViewCounts<T extends PostSummary>(posts: T[]): Promise<T[]> {
  const counts = await getPostViewCountsBySlugs(posts.map((post) => post.slug));

  return posts.map((post) => ({
    ...post,
    viewCount: counts.get(post.slug) ?? 0,
  }));
}

function mapPostDetail(row: Record<string, unknown>): PostDetail {
  return {
    ...mapPostSummary(row),
    content: String(row.content),
    createdAt: new Date(String(row.createdAt)).toISOString(),
    updatedAt: new Date(String(row.updatedAt)).toISOString(),
  };
}

const publishedClause = `p.status = 'PUBLISHED' AND p."publishedAt" <= NOW()`;

const postSelect = `
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p."coverImage",
  p."publishedAt",
  p."createdAt",
  p."updatedAt",
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
`;

const postFrom = `
  FROM "Post" p
  LEFT JOIN "PostTag" pt ON pt."postId" = p.id
  LEFT JOIN "Tag" t ON t.id = pt."tagId"
`;

function buildFilters(options: { tagSlug?: string }) {
  const filters = [publishedClause];
  const params: string[] = [];

  if (options.tagSlug) {
    params.push(options.tagSlug);
    filters.push(`EXISTS (
      SELECT 1
      FROM "PostTag" pt2
      JOIN "Tag" t2 ON t2.id = pt2."tagId"
      WHERE pt2."postId" = p.id AND t2.slug = $${params.length}
    )`);
  }

  return { where: filters.join(' AND '), params };
}

async function queryPosts(options: {
  page: number;
  limit: number;
  tagSlug?: string;
}): Promise<PaginatedResponse<PostSummary>> {
  const { page, limit, tagSlug } = options;
  const offset = (page - 1) * limit;
  const { where, params } = buildFilters({ tagSlug });

  const countRows = await query<{ total: number }>(
    `
    SELECT COUNT(DISTINCT p.id)::int as total
    ${postFrom}
    WHERE ${where}
    `,
    params,
  );

  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${postSelect}
    ${postFrom}
    WHERE ${where}
    GROUP BY p.id
    ORDER BY p."publishedAt" DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
    [...params, limit, offset],
  );

  const total = countRows[0]?.total ?? 0;
  const data = await attachViewCounts(rows.map(mapPostSummary));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listPosts(options: {
  page: number;
  limit: number;
  tag?: string;
}) {
  return queryPosts({
    page: options.page,
    limit: Math.min(options.limit, 50),
    tagSlug: options.tag,
  });
}

export async function getPostBySlug(slug: string): Promise<PostDetail> {
  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${postSelect}
    ${postFrom}
    WHERE ${publishedClause} AND p.slug = $1
    GROUP BY p.id
    LIMIT 1
    `,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Post "${slug}" not found`);
  }

  const [detail] = await attachViewCounts([mapPostDetail(rows[0])]);
  return detail;
}

export async function listTags(): Promise<Tag[]> {
  return query<Tag>(`
    SELECT id, name, slug
    FROM "Tag"
    ORDER BY name ASC
  `);
}

export async function listTagPosts(slug: string, page: number, limit: number) {
  const tags = await query<{ id: string }>(
    `SELECT id FROM "Tag" WHERE slug = $1 LIMIT 1`,
    [slug],
  );

  if (!tags[0]) {
    throw new Error(`Tag "${slug}" not found`);
  }

  return queryPosts({
    page,
    limit: Math.min(limit, 50),
    tagSlug: slug,
  });
}

export interface FeedPost {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: string;
}

export interface PostSitemapEntry {
  slug: string;
  updatedAt: string;
}

export async function listPublishedPostsForFeed(options?: {
  limit?: number;
}): Promise<FeedPost[]> {
  const limit = Math.min(options?.limit ?? 50, 100);

  const rows = await query<Record<string, unknown>>(
    `
    SELECT
      p.title,
      p.slug,
      p.excerpt,
      p.content,
      p."coverImage",
      p."publishedAt"
    FROM "Post" p
    WHERE ${publishedClause}
    ORDER BY p."publishedAt" DESC
    LIMIT $1
    `,
    [limit],
  );

  return rows.map((row) => ({
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    content: String(row.content),
    coverImage: row.coverImage ? String(row.coverImage) : null,
    publishedAt: new Date(String(row.publishedAt)).toISOString(),
  }));
}

export async function listPublishedPostSlugs(): Promise<PostSitemapEntry[]> {
  const rows = await query<{ slug: string; updatedAt: Date }>(
    `
    SELECT p.slug, p."updatedAt"
    FROM "Post" p
    WHERE ${publishedClause}
    ORDER BY p."publishedAt" DESC
    `,
  );

  return rows.map((row) => ({
    slug: row.slug,
    updatedAt: new Date(row.updatedAt).toISOString(),
  }));
}

export async function checkHealth() {
  await query('SELECT 1');
  return { status: 'ok', services: { database: 'ok' } };
}
