import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkHealth } from '../blog';
import { withGet } from '../http';

export async function handleHealthRoute(
  req: VercelRequest,
  res: VercelResponse,
) {
  await withGet(req, res, checkHealth);
}
