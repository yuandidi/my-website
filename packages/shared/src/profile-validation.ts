import type { ProfileLink, UpdateProfileInput } from './index';

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateUpdateProfileInput(input: UpdateProfileInput) {
  const errors: string[] = [];

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 50) {
      errors.push('name must be 1-50 characters');
    }
  }

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length < 1 || title.length > 100) {
      errors.push('title must be 1-100 characters');
    }
  }

  if (input.avatarUrl !== undefined) {
    const avatarUrl = input.avatarUrl.trim();
    if (avatarUrl.length < 1 || avatarUrl.length > 500) {
      errors.push('avatarUrl must be 1-500 characters');
    }
  }

  if (input.bio !== undefined && input.bio.length > 10000) {
    errors.push('bio must be at most 10000 characters');
  }

  if (input.skills !== undefined) {
    if (!Array.isArray(input.skills) || input.skills.length > 20) {
      errors.push('skills must be an array with at most 20 items');
    } else if (input.skills.some((skill) => skill.trim().length < 1 || skill.length > 50)) {
      errors.push('each skill must be 1-50 characters');
    }
  }

  if (input.links !== undefined) {
    if (!Array.isArray(input.links) || input.links.length > 10) {
      errors.push('links must be an array with at most 10 items');
    } else {
      for (const link of input.links as ProfileLink[]) {
        const label = link.label?.trim() ?? '';
        const href = link.href?.trim() ?? '';
        if (!label && !href) {
          continue;
        }
        if (label.length < 1 || label.length > 50) {
          errors.push('each link label must be 1-50 characters');
        }
        if (!isHttpUrl(href)) {
          errors.push('each link href must be a valid http(s) URL');
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}
