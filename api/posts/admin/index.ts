import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listAdminPosts } from '../../../lib/post-store';
import {
  getQueryNumber,
  requireDeveloper,
  withMethods,
} from '../../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withMethods(req, res, {
    GET: async () => {
      await requireDeveloper(req);

      const page = getQueryNumber(req.query.page, 1);
      const limit = getQueryNumber(req.query.limit, 20);

      return listAdminPosts({ page, limit });
    },
  });
}
