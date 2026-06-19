import type {
  CreateCategoryInput,
  CreatePostInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateTagInput,
} from '@my-blog/shared';
import {
  validateCreateCategoryInput,
  validateCreatePostInput,
  validateCreateTagInput,
  validateUpdateCategoryInput,
  validateUpdatePostInput,
  validateUpdateTagInput,
} from '@my-blog/shared';

export function hasPostUpdates(input: UpdatePostInput) {
  return (
    input.title !== undefined ||
    input.slug !== undefined ||
    input.excerpt !== undefined ||
    input.content !== undefined ||
    input.coverImage !== undefined ||
    input.status !== undefined ||
    input.categoryId !== undefined ||
    input.tagIds !== undefined
  );
}

export function hasCategoryUpdates(input: UpdateCategoryInput) {
  return input.name !== undefined || input.slug !== undefined;
}

export function hasTagUpdates(input: UpdateTagInput) {
  return input.name !== undefined || input.slug !== undefined;
}

export {
  validateCreateCategoryInput,
  validateCreatePostInput,
  validateCreateTagInput,
  validateUpdateCategoryInput,
  validateUpdatePostInput,
  validateUpdateTagInput,
};

export type {
  CreateCategoryInput,
  CreatePostInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateTagInput,
};
