import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreateCategoryInput, UpdateCategoryInput } from '@my-blog/shared';
import { listCategories, listCategoryPosts } from '../../lib/blog';
import { createCategory, deleteCategory, updateCategory } from '../../lib/taxonomy-store';
import { hasCategoryUpdates } from '../../lib/post-validation';
import {
  badRequest,
  getQueryNumber,
  notFound,
  parseJsonBody,
  requireDeveloper,
  withGet,
  withMethods,
} from '../../lib/http';
import { getPathSegments } from '../../lib/vercel-route';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = getPathSegments(req.query);

  if (segments.length === 0) {
    await withMethods(req, res, {
      GET: async () => listCategories(),
      POST: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<CreateCategoryInput>(req);
        return createCategory(body);
      },
    });
    return;
  }

  if (segments.length === 2 && segments[1] === 'posts') {
    const slug = segments[0];

    await withGet(req, res, async () => {
      const page = getQueryNumber(req.query.page, 1);
      const limit = getQueryNumber(req.query.limit, 10);

      return listCategoryPosts(slug, page, limit);
    });
    return;
  }

  if (segments.length === 1) {
    const slug = segments[0];

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
    return;
  }

  notFound(res, 'Category route not found');
}
