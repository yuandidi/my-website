import type {
  CreateCategoryInput,
  CreatePostInput,
  CreateTagInput,
  PostStatus,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateTagInput,
} from './index';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_CONTENT_LENGTH = 200_000;

function isPostStatus(value: unknown): value is PostStatus {
  return value === 'DRAFT' || value === 'PUBLISHED';
}

function validateSlugField(
  errors: string[],
  field: string,
  value: string | undefined,
) {
  if (value === undefined) {
    return;
  }

  const slug = value.trim();
  if (slug.length < 1 || slug.length > 80) {
    errors.push(`${field} must be 1-80 characters`);
    return;
  }

  if (!SLUG_PATTERN.test(slug)) {
    errors.push(`${field} must use lowercase letters, numbers, and hyphens`);
  }
}

function validateTagIds(errors: string[], tagIds: string[] | undefined) {
  if (tagIds === undefined) {
    return;
  }

  if (!Array.isArray(tagIds) || tagIds.length > 20) {
    errors.push('tagIds must be an array with at most 20 items');
    return;
  }

  if (tagIds.some((tagId) => typeof tagId !== 'string' || tagId.trim().length < 1)) {
    errors.push('each tagId must be a non-empty string');
  }
}

export function validateCreatePostInput(input: CreatePostInput) {
  const errors: string[] = [];

  const title = input.title?.trim() ?? '';
  if (title.length < 1 || title.length > 200) {
    errors.push('title must be 1-200 characters');
  }

  validateSlugField(errors, 'slug', input.slug);

  if (input.excerpt !== undefined && input.excerpt !== null && input.excerpt.length > 500) {
    errors.push('excerpt must be at most 500 characters');
  }

  const content = input.content?.trim() ?? '';
  if (content.length < 1) {
    errors.push('content must not be empty');
  } else if (content.length > MAX_CONTENT_LENGTH) {
    errors.push(`content must be at most ${MAX_CONTENT_LENGTH} characters`);
  }

  if (
    input.coverImage !== undefined &&
    input.coverImage !== null &&
    input.coverImage.length > 500
  ) {
    errors.push('coverImage must be at most 500 characters');
  }

  if (input.status !== undefined && !isPostStatus(input.status)) {
    errors.push('status must be DRAFT or PUBLISHED');
  }

  if (
    input.categoryId !== undefined &&
    input.categoryId !== null &&
    input.categoryId.trim().length < 1
  ) {
    errors.push('categoryId must be a non-empty string when provided');
  }

  validateTagIds(errors, input.tagIds);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function validateUpdatePostInput(input: UpdatePostInput) {
  const errors: string[] = [];

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length < 1 || title.length > 200) {
      errors.push('title must be 1-200 characters');
    }
  }

  validateSlugField(errors, 'slug', input.slug);

  if (input.excerpt !== undefined && input.excerpt !== null && input.excerpt.length > 500) {
    errors.push('excerpt must be at most 500 characters');
  }

  if (input.content !== undefined) {
    const content = input.content.trim();
    if (content.length < 1) {
      errors.push('content must not be empty');
    } else if (content.length > MAX_CONTENT_LENGTH) {
      errors.push(`content must be at most ${MAX_CONTENT_LENGTH} characters`);
    }
  }

  if (
    input.coverImage !== undefined &&
    input.coverImage !== null &&
    input.coverImage.length > 500
  ) {
    errors.push('coverImage must be at most 500 characters');
  }

  if (input.status !== undefined && !isPostStatus(input.status)) {
    errors.push('status must be DRAFT or PUBLISHED');
  }

  if (
    input.categoryId !== undefined &&
    input.categoryId !== null &&
    input.categoryId.trim().length < 1
  ) {
    errors.push('categoryId must be a non-empty string when provided');
  }

  validateTagIds(errors, input.tagIds);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function validateCreateCategoryInput(input: CreateCategoryInput) {
  const errors: string[] = [];

  const name = input.name?.trim() ?? '';
  if (name.length < 1 || name.length > 50) {
    errors.push('name must be 1-50 characters');
  }

  validateSlugField(errors, 'slug', input.slug);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function validateUpdateCategoryInput(input: UpdateCategoryInput) {
  const errors: string[] = [];

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 50) {
      errors.push('name must be 1-50 characters');
    }
  }

  validateSlugField(errors, 'slug', input.slug);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function validateCreateTagInput(input: CreateTagInput) {
  const errors: string[] = [];

  const name = input.name?.trim() ?? '';
  if (name.length < 1 || name.length > 50) {
    errors.push('name must be 1-50 characters');
  }

  validateSlugField(errors, 'slug', input.slug);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function validateUpdateTagInput(input: UpdateTagInput) {
  const errors: string[] = [];

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 50) {
      errors.push('name must be 1-50 characters');
    }
  }

  validateSlugField(errors, 'slug', input.slug);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}
