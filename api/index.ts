import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAuthRoute } from '../lib/api-handlers/auth';
import { handleCategoriesRoute } from '../lib/api-handlers/categories';
import { handleHealthRoute } from '../lib/api-handlers/health';
import { handlePostsRoute } from '../lib/api-handlers/posts';
import { handleProfileRoute } from '../lib/api-handlers/profile';
import { handleSiteMetaRoute } from '../lib/api-handlers/site-meta';
import { handleTagsRoute } from '../lib/api-handlers/tags';
import { notFound } from '../lib/http';
import { getApiPath } from '../lib/vercel-route';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = getApiPath(req);

  if (segments.length === 0) {
    notFound(res, 'API route not found');
    return;
  }

  const [resource, ...rest] = segments;

  switch (resource) {
    case 'health':
      await handleHealthRoute(req, res);
      return;
    case 'site-meta':
      await handleSiteMetaRoute(req, res);
      return;
    case 'profile':
      await handleProfileRoute(req, res);
      return;
    case 'posts':
      await handlePostsRoute(req, res, rest);
      return;
    case 'categories':
      await handleCategoriesRoute(req, res, rest);
      return;
    case 'tags':
      await handleTagsRoute(req, res, rest);
      return;
    case 'auth':
      await handleAuthRoute(req, res, rest);
      return;
    default:
      notFound(res, `API route "${resource}" not found`);
  }
}
