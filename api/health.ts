import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkHealth } from '../lib/blog';
import { withGet } from '../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withGet(req, res, checkHealth);
}
