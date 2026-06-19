import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { MeResponse } from '@my-blog/shared';
import { getAuthUser, sendJson, methodNotAllowed, serverError, unauthorized } from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      unauthorized(res);
      return;
    }

    const payload: MeResponse = { user };
    sendJson(res, 200, payload);
  } catch (error) {
    serverError(res, error);
  }
}
