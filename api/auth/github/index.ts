import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createOAuthState,
  getGithubAuthUrl,
  getSiteUrlFromHeaders,
} from '../../../lib/auth';
import { serverError } from '../../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

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
}
