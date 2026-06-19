import type { VercelRequest } from '@vercel/node';

/** Set by vercel.json rewrite: /api/(.*) -> /api/index?__path=$1 */
export const API_PATH_QUERY_KEY = '__path';

function splitPath(value: string): string[] {
  return value.split('/').filter(Boolean);
}

export function getApiPathFromNextParams(path?: string[]): string[] {
  return path?.filter(Boolean) ?? []
}

export function getApiPath(req: VercelRequest): string[] {
  const fromRewrite = req.query[API_PATH_QUERY_KEY];

  if (fromRewrite !== undefined && fromRewrite !== null && fromRewrite !== '') {
    const raw = Array.isArray(fromRewrite)
      ? fromRewrite.join('/')
      : String(fromRewrite);
    return splitPath(raw);
  }

  const pathname = (req.url ?? '').split('?')[0] ?? '';
  const match = pathname.match(/^\/api\/(.+)$/);
  if (!match?.[1] || match[1] === 'index') {
    return [];
  }

  return splitPath(match[1]);
}
