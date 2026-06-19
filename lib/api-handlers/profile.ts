import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { UpdateProfileInput } from '@my-blog/shared';
import { getSiteProfile, updateSiteProfile } from '../profile-store';
import { hasProfileUpdates } from '../profile-validation';
import {
  badRequest,
  notFound,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../http';

export async function handleProfileRoute(
  req: VercelRequest,
  res: VercelResponse,
) {
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

      if (!hasProfileUpdates(body)) {
        badRequest(res, 'No profile fields provided');
        return;
      }

      return updateSiteProfile(user.id, body);
    },
  });
}
