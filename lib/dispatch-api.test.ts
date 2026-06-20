import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('./api-handlers/health', () => ({ handleHealthRoute: vi.fn() }));
vi.mock('./api-handlers/site-meta', () => ({ handleSiteMetaRoute: vi.fn() }));
vi.mock('./api-handlers/profile', () => ({ handleProfileRoute: vi.fn() }));
vi.mock('./api-handlers/posts', () => ({ handlePostsRoute: vi.fn() }));
vi.mock('./api-handlers/tags', () => ({ handleTagsRoute: vi.fn() }));
vi.mock('./api-handlers/auth', () => ({ handleAuthRoute: vi.fn() }));
vi.mock('./api-handlers/analytics', () => ({ handleAnalyticsRoute: vi.fn() }));

import { handleAnalyticsRoute } from './api-handlers/analytics';
import { handleAuthRoute } from './api-handlers/auth';
import { handleHealthRoute } from './api-handlers/health';
import { handlePostsRoute } from './api-handlers/posts';
import { handleProfileRoute } from './api-handlers/profile';
import { handleSiteMetaRoute } from './api-handlers/site-meta';
import { handleTagsRoute } from './api-handlers/tags';
import { dispatchApiRoute } from './dispatch-api';

function mockRes() {
  const res = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
  };
  return res as unknown as VercelResponse;
}

const req = {} as VercelRequest;

describe('dispatchApiRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when segments are empty', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, []);
    expect(res.statusCode).toBe(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'API route not found' });
  });

  it('dispatches health', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['health']);
    expect(handleHealthRoute).toHaveBeenCalledWith(req, res);
  });

  it('dispatches site-meta', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['site-meta']);
    expect(handleSiteMetaRoute).toHaveBeenCalledWith(req, res);
  });

  it('dispatches profile', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['profile']);
    expect(handleProfileRoute).toHaveBeenCalledWith(req, res);
  });

  it('dispatches posts with nested segments', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['posts', 'admin']);
    expect(handlePostsRoute).toHaveBeenCalledWith(req, res, ['admin']);
  });

  it('dispatches tags with nested segments', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['tags', 'tech', 'posts']);
    expect(handleTagsRoute).toHaveBeenCalledWith(req, res, ['tech', 'posts']);
  });

  it('dispatches auth with nested segments', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['auth', 'github', 'callback']);
    expect(handleAuthRoute).toHaveBeenCalledWith(req, res, [
      'github',
      'callback',
    ]);
  });

  it('dispatches analytics with nested segments', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['analytics', 'summary']);
    expect(handleAnalyticsRoute).toHaveBeenCalledWith(req, res, ['summary']);
  });

  it('returns 404 for unknown resource', async () => {
    const res = mockRes();
    await dispatchApiRoute(req, res, ['unknown']);
    expect(res.statusCode).toBe(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'API route "unknown" not found',
    });
  });
});
