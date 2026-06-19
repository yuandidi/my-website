import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { MeResponse } from '@my-blog/shared';
import {
  createOAuthState,
  createSession,
  deleteSessionByToken,
  exchangeGithubCode,
  fetchGithubUser,
  findOrCreateUserFromGithub,
  getGithubAuthUrl,
  getSiteUrlFromHeaders,
  isDeveloperRole,
  parseSessionCookie,
  verifyOAuthState,
} from '../../lib/auth';
import { ensureProfileForUser } from '../../lib/profile-store';
import {
  clearSessionCookieHeader,
  getAuthUser,
  methodNotAllowed,
  notFound,
  sendJson,
  serverError,
  setSessionCookieHeader,
  unauthorized,
  withMethods,
} from '../../lib/http';
import { getPathSegments } from '../../lib/vercel-route';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = getPathSegments(req.query).join('/');

  if (route === 'github' && req.method === 'GET') {
    try {
      const siteUrl = getSiteUrlFromHeaders(
        req.headers.host,
        req.headers['x-forwarded-proto'],
      );
      const state = createOAuthState();
      const authUrl = getGithubAuthUrl(siteUrl, state);
      res.status(302).setHeader('Location', authUrl).end();
    } catch (error) {
      serverError(res, error);
    }
    return;
  }

  if (route === 'github/callback' && req.method === 'GET') {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : undefined;
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;

      if (!code || !state) {
        res.status(400).json({ message: 'Missing OAuth code or state' });
        return;
      }

      verifyOAuthState(state);

      const siteUrl = getSiteUrlFromHeaders(
        req.headers.host,
        req.headers['x-forwarded-proto'],
      );
      const accessToken = await exchangeGithubCode(code, siteUrl);
      const githubUser = await fetchGithubUser(accessToken);
      const user = await findOrCreateUserFromGithub(githubUser);

      if (isDeveloperRole(user.role)) {
        await ensureProfileForUser(user.id, {
          name: githubUser.name ?? githubUser.login,
          avatarUrl: githubUser.avatar_url,
        });
      }

      const session = await createSession(user.id);
      setSessionCookieHeader(res, session.token, session.maxAge);

      res.status(302).setHeader('Location', `${siteUrl}/profile`).end();
    } catch (error) {
      serverError(res, error);
    }
    return;
  }

  if (route === 'logout') {
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
    return;
  }

  if (route === 'me' && req.method === 'GET') {
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
    return;
  }

  if (!route) {
    methodNotAllowed(res);
    return;
  }

  notFound(res, `Auth route "${route}" not found`);
}
