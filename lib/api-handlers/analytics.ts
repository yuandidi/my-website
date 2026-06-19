import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateTrackEventsPayload } from '@my-blog/shared';
import { getAnalyticsSummary, insertAnalyticsEvents } from '../analytics-store';
import {
  getQueryNumber,
  notFound,
  parseJsonBody,
  requireDeveloper,
  withMethods,
} from '../http';

export async function handleAnalyticsRoute(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
) {
  if (segments.length === 1 && segments[0] === 'events') {
    await withMethods(req, res, {
      POST: async () => {
        const body = await parseJsonBody<unknown>(req);
        const payload = validateTrackEventsPayload(body);
        await insertAnalyticsEvents(payload);
        return { ok: true };
      },
    });
    return;
  }

  if (segments.length === 1 && segments[0] === 'summary') {
    await withMethods(req, res, {
      GET: async () => {
        await requireDeveloper(req);
        const days = getQueryNumber(req.query.days, 7);
        return getAnalyticsSummary(days);
      },
    });
    return;
  }

  notFound(res, 'Analytics route not found');
}
