import type { VercelRequest } from '@vercel/node';

export function getPathSegments(
  query: VercelRequest['query'],
  key = 'path',
): string[] {
  const raw = query[key];

  if (raw === undefined || raw === null || raw === '') {
    return [];
  }

  return (Array.isArray(raw) ? raw : [raw]).map((segment) => String(segment));
}
