import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleAuthRoute } from './api-handlers/auth'
import { handleCategoriesRoute } from './api-handlers/categories'
import { handleHealthRoute } from './api-handlers/health'
import { handlePostsRoute } from './api-handlers/posts'
import { handleProfileRoute } from './api-handlers/profile'
import { handleSiteMetaRoute } from './api-handlers/site-meta'
import { handleTagsRoute } from './api-handlers/tags'
import { notFound } from './http'

export async function dispatchApiRoute(
  req: VercelRequest,
  res: VercelResponse,
  segments: string[],
) {
  if (segments.length === 0) {
    notFound(res, 'API route not found')
    return
  }

  const [resource, ...rest] = segments

  switch (resource) {
    case 'health':
      await handleHealthRoute(req, res)
      return
    case 'site-meta':
      await handleSiteMetaRoute(req, res)
      return
    case 'profile':
      await handleProfileRoute(req, res)
      return
    case 'posts':
      await handlePostsRoute(req, res, rest)
      return
    case 'categories':
      await handleCategoriesRoute(req, res, rest)
      return
    case 'tags':
      await handleTagsRoute(req, res, rest)
      return
    case 'auth':
      await handleAuthRoute(req, res, rest)
      return
    default:
      notFound(res, `API route "${resource}" not found`)
  }
}
