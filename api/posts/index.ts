import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreatePostInput } from '@my-blog/shared';
import { listPosts } from '../../lib/blog';
import { createPost } from '../../lib/post-store';
import {
  getQueryNumber,
  getQueryString,
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
}
