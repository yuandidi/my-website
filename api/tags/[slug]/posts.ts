import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listTagPosts } from '../../../lib/blog';
import {
  getQueryNumber,
  withGet,
} from '../../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withGet(req, res, async () => {
    const slug = Array.isArray(req.query.slug)
      ? req.query.slug[0]
      : req.query.slug;

    if (!slug) {
      throw new Error('Tag slug is required');
    }

    const page = getQueryNumber(req.query.page, 1);
    const limit = getQueryNumber(req.query.limit, 10);

    return listTagPosts(slug, page, limit);
  });
}
