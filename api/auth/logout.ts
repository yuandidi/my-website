import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSessionByToken, parseSessionCookie } from '../../lib/auth';
import { clearSessionCookieHeader, withMethods } from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withMethods(req, res, {
    POST: async () => {
      const token = parseSessionCookie(req.headers.cookie);
      if (token) {
        await deleteSessionByToken(token);
      }
      clearSessionCookieHeader(res);
      return { ok: true };
    },
  });
}
