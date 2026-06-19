import { randomUUID } from 'node:crypto';
import type {
  Category,
  CreateCategoryInput,
  CreateTagInput,
  Tag,
  UpdateCategoryInput,
  UpdateTagInput,
} from '@my-blog/shared';
import { query } from './db';
import { slugifyName } from './post-store';
import {
  validateCreateCategoryInput,
  validateCreateTagInput,
  validateUpdateCategoryInput,
  validateUpdateTagInput,
} from './post-validation';

async function ensureUniqueSlug(
  table: 'Category' | 'Tag',
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

export async function createCategory(input: CreateCategoryInput) {
  validateCreateCategoryInput(input);

  const name = input.name.trim();
  const baseSlug = input.slug?.trim() || slugifyName(name);
  const slug = await ensureUniqueSlug('Category', baseSlug);
  const id = randomUUID();
  const now = new Date();

  const rows = await query<Category>(
    `
    INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, slug
    `,
    [id, name, slug, now, now],
  );

  return rows[0];
}

export async function updateCategory(slug: string, input: UpdateCategoryInput) {
  validateUpdateCategoryInput(input);

  const currentRows = await query<{ id: string }>(
    `SELECT id FROM "Category" WHERE slug = $1 LIMIT 1`,
    [slug],
  );

  if (!currentRows[0]) {
    throw new Error(`Category "${slug}" not found`);
  }

  const current = currentRows[0];
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(input.name.trim());
  }

  if (input.slug !== undefined) {
    const nextSlug = await ensureUniqueSlug(
      'Category',
      input.slug.trim(),
      current.id,
    );
    fields.push(`slug = $${index++}`);
    values.push(nextSlug);
  }

  if (fields.length === 0) {
    const rows = await query<Category>(
      `SELECT id, name, slug FROM "Category" WHERE id = $1`,
      [current.id],
    );
    return rows[0];
  }

  fields.push(`"updatedAt" = $${index++}`);
  values.push(new Date());
  values.push(current.id);

  const rows = await query<Category>(
    `
    UPDATE "Category"
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING id, name, slug
    `,
    values,
  );

  return rows[0];
}

export async function deleteCategory(slug: string) {
  const rows = await query<{ id: string }>(
    `DELETE FROM "Category" WHERE slug = $1 RETURNING id`,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Category "${slug}" not found`);
  }
}

export async function createTag(input: CreateTagInput) {
  validateCreateTagInput(input);

  const name = input.name.trim();
  const baseSlug = input.slug?.trim() || slugifyName(name);
  const slug = await ensureUniqueSlug('Tag', baseSlug);
  const id = randomUUID();
  const now = new Date();

  const rows = await query<Tag>(
    `
    INSERT INTO "Tag" (id, name, slug, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, slug
    `,
    [id, name, slug, now, now],
  );

  return rows[0];
}

export async function updateTag(slug: string, input: UpdateTagInput) {
  validateUpdateTagInput(input);

  const currentRows = await query<{ id: string }>(
    `SELECT id FROM "Tag" WHERE slug = $1 LIMIT 1`,
    [slug],
  );

  if (!currentRows[0]) {
    throw new Error(`Tag "${slug}" not found`);
  }

  const current = currentRows[0];
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(input.name.trim());
  }

  if (input.slug !== undefined) {
    const nextSlug = await ensureUniqueSlug('Tag', input.slug.trim(), current.id);
    fields.push(`slug = $${index++}`);
    values.push(nextSlug);
  }

  if (fields.length === 0) {
    const rows = await query<Tag>(
      `SELECT id, name, slug FROM "Tag" WHERE id = $1`,
      [current.id],
    );
    return rows[0];
  }

  fields.push(`"updatedAt" = $${index++}`);
  values.push(new Date());
  values.push(current.id);

  const rows = await query<Tag>(
    `
    UPDATE "Tag"
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING id, name, slug
    `,
    values,
  );

  return rows[0];
}

export async function deleteTag(slug: string) {
  const rows = await query<{ id: string }>(
    `DELETE FROM "Tag" WHERE slug = $1 RETURNING id`,
    [slug],
  );

  if (!rows[0]) {
    throw new Error(`Tag "${slug}" not found`);
  }
}
