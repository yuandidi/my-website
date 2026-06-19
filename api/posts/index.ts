import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listPosts } from '../../lib/blog';
import {
  getQueryNumber,
  getQueryString,
  withGet,
} from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withGet(req, res, async () => {
    const page = getQueryNumber(req.query.page, 1);
    const limit = getQueryNumber(req.query.limit, 10);
    const category = getQueryString(req.query.category);
    const tag = getQueryString(req.query.tag);

    return listPosts({ page, limit, category, tag });
  });
}
