import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreateTagInput } from '@my-blog/shared';
import { listTags } from '../../lib/blog';
import { createTag } from '../../lib/taxonomy-store';
import {
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withMethods(req, res, {
    GET: async () => listTags(),
    POST: async () => {
      await requireDeveloper(req);
      const body = await parseJsonBody<CreateTagInput>(req);
      return createTag(body);
    },
  });
}
