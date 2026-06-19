import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createSession,
  exchangeGithubCode,
  fetchGithubUser,
  findOrCreateUserFromGithub,
  getSiteUrlFromHeaders,
  verifyOAuthState,
} from '../../../lib/auth';
import { ensureProfileForUser } from '../../../lib/profile-store';
import { serverError, setSessionCookieHeader } from '../../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

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

    await ensureProfileForUser(user.id, {
      name: githubUser.name ?? githubUser.login,
      avatarUrl: githubUser.avatar_url,
    });

    const session = await createSession(user.id);
    setSessionCookieHeader(res, session.token, session.maxAge);

    res.status(302).setHeader('Location', `${siteUrl}/profile/edit`).end();
  } catch (error) {
    const siteUrl = getSiteUrlFromHeaders(
      req.headers.host,
      req.headers['x-forwarded-proto'],
    );

    if (error instanceof Error && error.message.includes('not allowed')) {
      res.status(302).setHeader('Location', `${siteUrl}/profile?auth=denied`).end();
      return;
    }
    serverError(res, error);
  }
}
