import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdateTagInput } from '@my-blog/shared';
import { deleteTag, updateTag } from '../../lib/taxonomy-store';
import { hasTagUpdates } from '../../lib/post-validation';
import {
  badRequest,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug)
    ? req.query.slug[0]
    : req.query.slug;

  if (!slug) {
    badRequest(res, 'Tag slug is required');
    return;
  }

  await withMethods(
    req,
    res,
    {
      PATCH: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<UpdateTagInput>(req);

        if (!hasTagUpdates(body)) {
          badRequest(res, 'No tag fields provided');
          return;
        }

        return updateTag(slug, body);
      },
      DELETE: async () => {
        await requireDeveloper(req);
        await deleteTag(slug);
      },
    },
    { emptyStatus: 204 },
  );
}
