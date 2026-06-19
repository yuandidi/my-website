import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreatePostInput, UpdatePostInput } from '@my-blog/shared';
import { getPostBySlug, listPosts } from '../blog';
import {
  createPost,
  deletePost,
  getAdminPostBySlug,
  listAdminPosts,
  updatePost,
} from '../post-store';
import { hasPostUpdates } from '../post-validation';
import {
  badRequest,
  getAuthUser,
  getQueryNumber,
  getQueryString,
  notFound,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../http';

export async function handlePostsRoute(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
) {
  if (segments.length === 0) {
    await withMethods(req, res, {
      GET: async () => {
        const page = getQueryNumber(req.query.page, 1);
        const limit = getQueryNumber(req.query.limit, 10);
        const category = getQueryString(req.query.category);
        const tag = getQueryString(req.query.tag);

        return listPosts({ page, limit, category, tag });
      },
      POST: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<CreatePostInput>(req);
        return createPost(body);
      },
    });
    return;
  }

  if (segments.length === 1 && segments[0] === 'admin') {
    await withMethods(req, res, {
      GET: async () => {
        await requireDeveloper(req);

        const page = getQueryNumber(req.query.page, 1);
        const limit = getQueryNumber(req.query.limit, 20);

        return listAdminPosts({ page, limit });
      },
    });
    return;
  }

  if (segments.length === 1) {
    const slug = segments[0];

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
    return;
  }

  notFound(res, 'Post route not found');
}
