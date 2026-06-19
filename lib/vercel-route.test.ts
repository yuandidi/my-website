import { describe, expect, it } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { API_PATH_QUERY_KEY, getApiPath } from './vercel-route';

function mockReq(
  url: string,
  query: VercelRequest['query'] = {},
): VercelRequest {
  return { url, query } as VercelRequest;
}

describe('getApiPath', () => {
  it('parses __path from vercel.json rewrite', () => {
    const req = mockReq('/api/index?page=1', {
      [API_PATH_QUERY_KEY]: 'categories/tech/posts',
      page: '1',
    });
    expect(getApiPath(req)).toEqual(['categories', 'tech', 'posts']);
  });

  it('parses __path array segments from rewrite', () => {
    const req = mockReq('/api/index', {
      [API_PATH_QUERY_KEY]: ['posts', 'admin'],
    });
    expect(getApiPath(req)).toEqual(['posts', 'admin']);
  });

  it('falls back to direct /api pathname for local dev', () => {
    const req = mockReq('/api/posts/admin?page=1');
    expect(getApiPath(req)).toEqual(['posts', 'admin']);
  });

  it('parses single segment routes', () => {
    const req = mockReq('/api/index', {
      [API_PATH_QUERY_KEY]: 'categories',
    });
    expect(getApiPath(req)).toEqual(['categories']);
  });
});
