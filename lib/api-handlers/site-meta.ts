import type { SiteMetaResponse } from '@my-blog/shared';
import { listTags } from '../blog';
import { getAuthUser, withGet } from '../http';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function handleSiteMetaRoute(
  req: VercelRequest,
  res: VercelResponse,
) {
  await withGet(req, res, async () => {
    const [user, tags] = await Promise.all([getAuthUser(req), listTags()]);

    const payload: SiteMetaResponse = {
      user,
      tags,
    };

    return payload;
  });
}
