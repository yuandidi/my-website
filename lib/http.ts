import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AuthUser } from '@my-blog/shared';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  getUserBySessionToken,
  parseSessionCookie,
} from './auth';

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

export function badRequest(res: VercelResponse, message: string) {
  sendJson(res, 400, { message });
}

export function unauthorized(res: VercelResponse, message = 'Unauthorized') {
  sendJson(res, 401, { message });
}

export function forbidden(res: VercelResponse, message = 'Forbidden') {
  sendJson(res, 403, { message });
}

export function noContent(res: VercelResponse) {
  res.status(204).end();
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

export async function parseJsonBody<T>(req: VercelRequest): Promise<T> {
  const body = req.body;

  if (typeof body === 'string') {
    return body.trim() ? (JSON.parse(body) as T) : ({} as T);
  }

  if (Buffer.isBuffer(body)) {
    const text = body.toString('utf8');
    return text.trim() ? (JSON.parse(text) as T) : ({} as T);
  }

  if (body && typeof body === 'object') {
    return body as T;
  }

  return {} as T;
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

type MethodHandler = () => Promise<unknown>;

export async function withMethods(
  req: VercelRequest,
  res: VercelResponse,
  handlers: Partial<Record<string, MethodHandler>>,
  options?: { emptyStatus?: number },
) {
  const method = req.method ?? 'GET';
  const handler = handlers[method];

  if (!handler) {
    methodNotAllowed(res);
    return;
  }

  try {
    const data = await handler();
    if (data !== undefined) {
      sendJson(res, 200, data);
      return;
    }

    if (options?.emptyStatus === 204) {
      noContent(res);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.endsWith('not found')) {
        notFound(res, error.message);
        return;
      }
      if (error.message === 'Unauthorized') {
        unauthorized(res);
        return;
      }
      if (error.message === 'Forbidden') {
        forbidden(res);
        return;
      }
      if (
        error.message.includes('must be') ||
        error.message.includes('Invalid OAuth') ||
        error.message.includes('not allowed')
      ) {
        badRequest(res, error.message);
        return;
      }
    }
    serverError(res, error);
  }
}

export async function getAuthUser(req: VercelRequest): Promise<AuthUser | null> {
  const cookieHeader = req.headers.cookie;
  const token = parseSessionCookie(cookieHeader);
  return getUserBySessionToken(token);
}

export async function requireDeveloper(req: VercelRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role !== 'DEVELOPER' && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  return user;
}

export function setSessionCookieHeader(
  res: VercelResponse,
  token: string,
  maxAge: number,
) {
  res.setHeader('Set-Cookie', buildSessionCookie(token, maxAge));
}

export function clearSessionCookieHeader(res: VercelResponse) {
  res.setHeader('Set-Cookie', buildClearSessionCookie());
}
