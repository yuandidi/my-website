import type {
  Category,
  PaginatedResponse,
  PostDetail,
  PostSummary,
  Tag,
} from '@my-blog/shared';
import { query } from './db';

function mapTags(value: unknown): Tag[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return JSON.parse(value) as Tag[];
  }
  return value as Tag[];
}

function mapPostSummary(row: Record<string, unknown>): PostSummary {
  const category =
    row.category_id && row.category_name && row.category_slug
      ? {
          id: String(row.category_id),
          name: String(row.category_name),
          slug: String(row.category_slug),
        }
      : null;

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    coverImage: row.coverImage ? String(row.coverImage) : null,
    publishedAt: row.publishedAt
      ? new Date(String(row.publishedAt)).toISOString()
      : null,
    category,
    tags: mapTags(row.tags),
  };
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
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
`;

const postFrom = `
  FROM "Post" p
  LEFT JOIN "Category" c ON p."categoryId" = c.id
  LEFT JOIN "PostTag" pt ON pt."postId" = p.id
  LEFT JOIN "Tag" t ON t.id = pt."tagId"
`;

function buildFilters(options: {
  categorySlug?: string;
  tagSlug?: string;
}) {
  const filters = [publishedClause];
  const params: string[] = [];

  if (options.categorySlug) {
    params.push(options.categorySlug);
    filters.push(`c.slug = $${params.length}`);
  }

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
  categorySlug?: string;
  tagSlug?: string;
}): Promise<PaginatedResponse<PostSummary>> {
  const { page, limit, categorySlug, tagSlug } = options;
  const offset = (page - 1) * limit;
  const { where, params } = buildFilters({ categorySlug, tagSlug });

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
    GROUP BY p.id, c.id
    ORDER BY p."publishedAt" DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
    [...params, limit, offset],
  );

  const total = countRows[0]?.total ?? 0;

  return {
    data: rows.map(mapPostSummary),
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
  category?: string;
  tag?: string;
}) {
  return queryPosts({
    page: options.page,
    limit: Math.min(options.limit, 50),
    categorySlug: options.category,
    tagSlug: options.tag,
  });
}

export async function getPostBySlug(slug: string): Promise<PostDetail> {
  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${postSelect}
    ${postFrom}
    WHERE ${publishedClause} AND p.slug = $1
    GROUP BY p.id, c.id
    LIMIT 1
    `,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Post "${slug}" not found`);
  }

  return mapPostDetail(rows[0]);
}

export async function listCategories(): Promise<Category[]> {
  return query<Category>(`
    SELECT id, name, slug
    FROM "Category"
    ORDER BY name ASC
  `);
}

export async function listCategoryPosts(
  slug: string,
  page: number,
  limit: number,
) {
  const categories = await query<{ id: string }>(
    `SELECT id FROM "Category" WHERE slug = $1 LIMIT 1`,
    [slug],
  );

  if (!categories[0]) {
    throw new Error(`Category "${slug}" not found`);
  }

  return queryPosts({
    page,
    limit: Math.min(limit, 50),
    categorySlug: slug,
  });
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

export async function checkHealth() {
  await query('SELECT 1');
  return { status: 'ok', services: { database: 'ok' } };
}
