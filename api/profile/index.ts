import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdateProfileInput } from '@my-blog/shared';
import { getSiteProfile, updateSiteProfile } from '../../lib/profile-store';
import {
  notFound,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withMethods(req, res, {
    GET: async () => {
      const profile = await getSiteProfile();
      if (!profile) {
        notFound(res, 'Profile not found');
        return;
      }
      return profile;
    },
    PATCH: async () => {
      const user = await requireDeveloper(req);
      const body = await parseJsonBody<UpdateProfileInput>(req);
      return updateSiteProfile(user.id, body);
    },
  });
}
