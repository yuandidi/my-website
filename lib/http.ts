import type { VercelRequest, VercelResponse } from '@vercel/node';

export function sendJson(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.json(data);
}

export function methodNotAllowed(res: VercelResponse) {
  sendJson(res, 405, { message: 'Method not allowed' });
}

export function notFound(res: VercelResponse, message: string) {
  sendJson(res, 404, { message });
}

export function serverError(res: VercelResponse, error: unknown) {
  console.error(error);
  sendJson(res, 500, { message: 'Internal server error' });
}

export function getQueryNumber(
  value: string | string[] | undefined,
  fallback: number,
) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getQueryString(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export async function withGet(
  req: VercelRequest,
  res: VercelResponse,
  handler: () => Promise<unknown>,
) {
  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  try {
    const data = await handler();
    sendJson(res, 200, data);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('not found')) {
      notFound(res, error.message);
      return;
    }
    serverError(res, error);
  }
}
