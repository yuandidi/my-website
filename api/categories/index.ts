import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreateCategoryInput } from '@my-blog/shared';
import { listCategories } from '../../lib/blog';
import { createCategory } from '../../lib/taxonomy-store';
import {
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withMethods(req, res, {
    GET: async () => listCategories(),
    POST: async () => {
      await requireDeveloper(req);
      const body = await parseJsonBody<CreateCategoryInput>(req);
      return createCategory(body);
    },
  });
}
