import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdatePostInput } from '@my-blog/shared';
import { getPostBySlug } from '../../lib/blog';
import {
  deletePost,
  getAdminPostBySlug,
  updatePost,
} from '../../lib/post-store';
import { hasPostUpdates } from '../../lib/post-validation';
import {
  badRequest,
  getAuthUser,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../../lib/http';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug)
    ? req.query.slug[0]
    : req.query.slug;

  if (!slug) {
    badRequest(res, 'Post slug is required');
    return;
  }

  await withMethods(
    req,
    res,
    {
      GET: async () => {
        const user = await getAuthUser(req);
        if (user?.role === 'DEVELOPER' || user?.role === 'ADMIN') {
          return getAdminPostBySlug(slug);
        }

        return getPostBySlug(slug);
      },
      PATCH: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<UpdatePostInput>(req);

        if (!hasPostUpdates(body)) {
          badRequest(res, 'No post fields provided');
          return;
        }

        return updatePost(slug, body);
      },
      DELETE: async () => {
        await requireDeveloper(req);
        await deletePost(slug);
      },
    },
    { emptyStatus: 204 },
  );
}
