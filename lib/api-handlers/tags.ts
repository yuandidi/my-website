import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CreateTagInput, UpdateTagInput } from '@my-blog/shared';
import { listTagPosts, listTags } from '../blog';
import { createTag, deleteTag, updateTag } from '../taxonomy-store';
import { hasTagUpdates } from '../post-validation';
import {
  badRequest,
  getQueryNumber,
  notFound,
  parseJsonBody,
  requireDeveloper,
  withGet,
  withMethods,
} from '../http';

export async function handleTagsRoute(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
) {
  if (segments.length === 0) {
    await withMethods(req, res, {
      GET: async () => listTags(),
      POST: async () => {
        await requireDeveloper(req);
        const body = await parseJsonBody<CreateTagInput>(req);
        return createTag(body);
      },
    });
    return;
  }

  if (segments.length === 2 && segments[1] === 'posts') {
    const slug = segments[0];

    await withGet(req, res, async () => {
      const page = getQueryNumber(req.query.page, 1);
      const limit = getQueryNumber(req.query.limit, 10);

      return listTagPosts(slug, page, limit);
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
    return;
  }

  notFound(res, 'Tag route not found');
}
