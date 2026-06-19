import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SiteMetaResponse } from '@my-blog/shared';
import { listCategories } from '../blog';
import { getAuthUser, withGet } from '../http';

export async function handleSiteMetaRoute(
  req: VercelRequest,
  res: VercelResponse,
) {
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
