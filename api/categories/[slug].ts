import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdateCategoryInput } from '@my-blog/shared';
import {
  deleteCategory,
  updateCategory,
} from '../../lib/taxonomy-store';
import { hasCategoryUpdates } from '../../lib/post-validation';
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
    badRequest(res, 'Category slug is required');
    return;
  }

  await withMethods(
    req,
    res,
    {
      PATCH: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<UpdateCategoryInput>(req);

        if (!hasCategoryUpdates(body)) {
          badRequest(res, 'No category fields provided');
          return;
        }

        return updateCategory(slug, body);
      },
      DELETE: async () => {
        await requireDeveloper(req);
        await deleteCategory(slug);
      },
    },
    { emptyStatus: 204 },
  );
}
