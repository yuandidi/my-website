import type { VercelRequest } from '@vercel/node';

export function getPathSegments(
  query: VercelRequest['query'],
  key = 'path',
): string[] {
  const raw = query[key];

  if (raw === undefined || raw === null || raw === '') {
    return [];
  }

  return (Array.isArray(raw) ? raw : [raw])
    .flatMap((segment) => String(segment).split('/'))
    .filter(Boolean);
}

export function getRouteSegments(req: VercelRequest): string[] {
  const fromQuery = getPathSegments(req.query, 'route');
  if (fromQuery.length > 0) {
    return fromQuery;
  }

  const pathname = (req.url ?? '').split('?')[0] ?? '';
  const match = pathname.match(/^\/api\/(.+)$/);
  if (!match?.[1]) {
    return [];
  }

  return match[1].split('/').filter(Boolean);
}
