import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SiteMetaResponse } from '@my-blog/shared';
import { getAuthUser, withGet } from '../../lib/http';
import { listCategories } from '../../lib/blog';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withGet(req, res, async () => {
    const [user, categories] = await Promise.all([
      getAuthUser(req),
      listCategories(),
    ]);

    const payload: SiteMetaResponse = {
      user,
      categories,
    };

    return payload;
  });
}
