import type { UpdateProfileInput } from '@my-blog/shared';
import { validateUpdateProfileInput } from '@my-blog/shared';

export function hasProfileUpdates(input: UpdateProfileInput) {
  return (
    input.name !== undefined ||
    input.title !== undefined ||
    input.avatarUrl !== undefined ||
    input.bio !== undefined ||
    input.skills !== undefined ||
    input.links !== undefined
  );
}

export { validateUpdateProfileInput };

export type { ProfileLink, UpdateProfileInput } from '@my-blog/shared';
