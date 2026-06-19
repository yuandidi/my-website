import type {
  CreatePostInput,
  CreateTagInput,
  UpdatePostInput,
  UpdateTagInput,
} from '@my-blog/shared';
import {
  validateCreatePostInput,
  validateCreateTagInput,
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
    input.tagIds !== undefined
  );
}

export function hasTagUpdates(input: UpdateTagInput) {
  return input.name !== undefined || input.slug !== undefined;
}

export {
  validateCreatePostInput,
  validateCreateTagInput,
  validateUpdatePostInput,
  validateUpdateTagInput,
};

export type {
  CreatePostInput,
  CreateTagInput,
  UpdatePostInput,
  UpdateTagInput,
};
