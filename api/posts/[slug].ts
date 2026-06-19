import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPostBySlug } from '../../lib/blog';
import { withGet } from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withGet(req, res, async () => {
    const slug = Array.isArray(req.query.slug)
      ? req.query.slug[0]
      : req.query.slug;

    if (!slug) {
      throw new Error('Post slug is required');
    }

    return getPostBySlug(slug);
  });
}
