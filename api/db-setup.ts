import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySchema, seedDatabase } from '../lib/setup';
import { sendJson, serverError } from '../lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  const secret = process.env.DB_SETUP_SECRET;
  const provided = req.headers['x-setup-secret'];

  if (!secret || provided !== secret) {
    sendJson(res, 401, { message: 'Unauthorized' });
    return;
  }

  try {
    await applySchema();
    const counts = await seedDatabase();
    sendJson(res, 200, { status: 'ok', ...counts });
  } catch (error) {
    serverError(res, error);
  }
}
