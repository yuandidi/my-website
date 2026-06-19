import { randomUUID } from 'node:crypto';
import type {
  AdminPostDetail,
  AdminPostSummary,
  CreatePostInput,
  PaginatedResponse,
  PostStatus,
  Tag,
  UpdatePostInput,
} from '@my-blog/shared';
import { query } from './db';
import {
  validateCreatePostInput,
  validateUpdatePostInput,
} from './post-validation';

function mapTags(value: unknown): Tag[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return JSON.parse(value) as Tag[];
  }
  return value as Tag[];
}

function mapAdminPostSummary(row: Record<string, unknown>): AdminPostSummary {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    coverImage: row.coverImage ? String(row.coverImage) : null,
    publishedAt: row.publishedAt
      ? new Date(String(row.publishedAt)).toISOString()
      : null,
    status: String(row.status) as PostStatus,
    tags: mapTags(row.tags),
  };
}

function mapAdminPostDetail(row: Record<string, unknown>): AdminPostDetail {
  const tagIds = Array.isArray(row.tag_ids)
    ? row.tag_ids.map((id) => String(id))
    : typeof row.tag_ids === 'string'
      ? (JSON.parse(row.tag_ids) as string[])
      : [];

  return {
    ...mapAdminPostSummary(row),
    content: String(row.content),
    createdAt: new Date(String(row.createdAt)).toISOString(),
    updatedAt: new Date(String(row.updatedAt)).toISOString(),
    tagIds,
  };
}

const adminPostSelect = `
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p."coverImage",
  p."publishedAt",
  p.status,
  p."createdAt",
  p."updatedAt",
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags,
  COALESCE(
    json_agg(t.id) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tag_ids
`;

const adminPostFrom = `
  FROM "Post" p
  LEFT JOIN "PostTag" pt ON pt."postId" = p.id
  LEFT JOIN "Tag" t ON t.id = pt."tagId"
`;

export function slugifyName(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || 'item';
}

async function ensureUniqueSlug(
  table: 'Post' | 'Tag',
  baseSlug: string,
  excludeId?: string,
) {
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const rows = await query<{ id: string }>(
      excludeId
        ? `SELECT id FROM "${table}" WHERE slug = $1 AND id <> $2 LIMIT 1`
        : `SELECT id FROM "${table}" WHERE slug = $1 LIMIT 1`,
      excludeId ? [slug, excludeId] : [slug],
    );

    if (!rows[0]) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function fetchAdminPostById(id: string): Promise<AdminPostDetail> {
  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${adminPostSelect}
    ${adminPostFrom}
    WHERE p.id = $1
    GROUP BY p.id
    LIMIT 1
    `,
    [id],
  );

  if (!rows[0]) {
    throw new Error('Post not found');
  }

  return mapAdminPostDetail(rows[0]);
}

async function fetchAdminPostBySlug(slug: string): Promise<AdminPostDetail> {
  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${adminPostSelect}
    ${adminPostFrom}
    WHERE p.slug = $1
    GROUP BY p.id
    LIMIT 1
    `,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Post "${slug}" not found`);
  }

  return mapAdminPostDetail(rows[0]);
}

async function assertTagsExist(tagIds: string[] | undefined) {
  if (!tagIds || tagIds.length === 0) {
    return;
  }

  const rows = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM "Tag" WHERE id = ANY($1::text[])`,
    [tagIds],
  );

  if ((rows[0]?.count ?? 0) !== tagIds.length) {
    throw new Error('One or more tags not found');
  }
}

async function replacePostTags(postId: string, tagIds: string[] | undefined) {
  await query(`DELETE FROM "PostTag" WHERE "postId" = $1`, [postId]);

  if (!tagIds || tagIds.length === 0) {
    return;
  }

  for (const tagId of tagIds) {
    await query(
      `INSERT INTO "PostTag" ("postId", "tagId") VALUES ($1, $2)`,
      [postId, tagId],
    );
  }
}

function resolvePublishedAt(
  status: PostStatus,
  publishedAt?: string | null,
  currentPublishedAt?: Date | null,
) {
  if (status === 'DRAFT') {
    return null;
  }

  if (publishedAt) {
    return new Date(publishedAt);
  }

  return currentPublishedAt ?? new Date();
}

export async function listAdminPosts(options: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<AdminPostSummary>> {
  const { page, limit } = options;
  const safeLimit = Math.min(limit, 50);
  const offset = (page - 1) * safeLimit;

  const countRows = await query<{ total: number }>(
    `SELECT COUNT(*)::int as total FROM "Post"`,
  );
  const total = countRows[0]?.total ?? 0;

  const rows = await query<Record<string, unknown>>(
    `
    SELECT ${adminPostSelect}
    ${adminPostFrom}
    GROUP BY p.id
    ORDER BY p."updatedAt" DESC
    LIMIT $1 OFFSET $2
    `,
    [safeLimit, offset],
  );

  return {
    data: rows.map(mapAdminPostSummary),
    meta: {
      page,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getAdminPostBySlug(slug: string) {
  return fetchAdminPostBySlug(slug);
}

export async function createPost(input: CreatePostInput) {
  validateCreatePostInput(input);

  const title = input.title.trim();
  const content = input.content.trim();
  const status = input.status ?? 'DRAFT';
  const baseSlug = input.slug?.trim() || slugifyName(title);
  const slug = await ensureUniqueSlug('Post', baseSlug);

  await assertTagsExist(input.tagIds);

  const id = randomUUID();
  const now = new Date();
  const publishedAt = resolvePublishedAt(status, null, null);

  await query(
    `
    INSERT INTO "Post" (
      id, title, slug, excerpt, content, "coverImage", "publishedAt", status, "categoryId", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `,
    [
      id,
      title,
      slug,
      input.excerpt?.trim() || null,
      content,
      input.coverImage?.trim() || null,
      publishedAt,
      status,
      null,
      now,
      now,
    ],
  );

  await replacePostTags(id, input.tagIds);

  return fetchAdminPostById(id);
}

export async function updatePost(slug: string, input: UpdatePostInput) {
  validateUpdatePostInput(input);

  const currentRows = await query<{
    id: string;
    status: PostStatus;
    publishedAt: Date | null;
  }>(
    `SELECT id, status, "publishedAt" FROM "Post" WHERE slug = $1 LIMIT 1`,
    [slug],
  );

  if (!currentRows[0]) {
    throw new Error(`Post "${slug}" not found`);
  }

  const current = currentRows[0];

  if (input.tagIds !== undefined) {
    await assertTagsExist(input.tagIds);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(input.title.trim());
  }

  if (input.slug !== undefined) {
    const nextSlug = await ensureUniqueSlug(
      'Post',
      input.slug.trim(),
      current.id,
    );
    fields.push(`slug = $${index++}`);
    values.push(nextSlug);
  }

  if (input.excerpt !== undefined) {
    fields.push(`excerpt = $${index++}`);
    values.push(input.excerpt?.trim() || null);
  }

  if (input.content !== undefined) {
    fields.push(`content = $${index++}`);
    values.push(input.content.trim());
  }

  if (input.coverImage !== undefined) {
    fields.push(`"coverImage" = $${index++}`);
    values.push(input.coverImage?.trim() || null);
  }

  const nextStatus = input.status ?? current.status;
  if (input.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(input.status);
    const publishedAt = resolvePublishedAt(
      nextStatus,
      null,
      current.publishedAt,
    );
    fields.push(`"publishedAt" = $${index++}`);
    values.push(publishedAt);
  }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = $${index++}`);
    values.push(new Date());
    values.push(current.id);

    await query(
      `UPDATE "Post" SET ${fields.join(', ')} WHERE id = $${index}`,
      values,
    );
  }

  if (input.tagIds !== undefined) {
    await replacePostTags(current.id, input.tagIds);
  }

  const updatedSlug =
    input.slug !== undefined
      ? (
          await query<{ slug: string }>(
            `SELECT slug FROM "Post" WHERE id = $1`,
            [current.id],
          )
        )[0]?.slug ?? slug
      : slug;

  return fetchAdminPostBySlug(updatedSlug);
}

export async function deletePost(slug: string) {
  const rows = await query<{ id: string }>(
    `DELETE FROM "Post" WHERE slug = $1 RETURNING id`,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Post "${slug}" not found`);
  }
}
