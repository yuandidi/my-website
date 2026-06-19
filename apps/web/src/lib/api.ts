import {
  API_ROUTES,
  type Category,
  type MeResponse,
  type PaginatedResponse,
  type PostDetail,
  type PostSummary,
  type PostsQueryParams,
  type SiteMetaResponse,
  type SiteProfile,
  type Tag,
  type UpdateProfileInput,
} from '@my-blog/shared'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = await response.text()
    try {
      const json = JSON.parse(message) as { message?: string }
      message = json.message ?? message
    } catch {
      // keep raw text
    }
    throw new ApiError(response.status, message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function buildQuery(params?: PostsQueryParams) {
  if (!params) return ''

  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.category) search.set('category', params.category)
  if (params.tag) search.set('tag', params.tag)

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getGithubLoginUrl() {
  return `${API_BASE}${API_ROUTES.auth.github}`
}

export const api = {
  getPosts(params?: PostsQueryParams) {
    return request<PaginatedResponse<PostSummary>>(
      `${API_ROUTES.posts}${buildQuery(params)}`,
    )
  },
  getPost(slug: string) {
    return request<PostDetail>(API_ROUTES.postBySlug(slug))
  },
  getCategories() {
    return request<Category[]>(API_ROUTES.categories)
  },
  getCategoryPosts(slug: string, params?: PostsQueryParams) {
    return request<PaginatedResponse<PostSummary>>(
      `${API_ROUTES.categoryPosts(slug)}${buildQuery(params)}`,
    )
  },
  getTags() {
    return request<Tag[]>(API_ROUTES.tags)
  },
  getTagPosts(slug: string, params?: PostsQueryParams) {
    return request<PaginatedResponse<PostSummary>>(
      `${API_ROUTES.tagPosts(slug)}${buildQuery(params)}`,
    )
  },
  getSiteMeta() {
    return request<SiteMetaResponse>(API_ROUTES.siteMeta)
  },
  getProfile() {
    return request<SiteProfile>(API_ROUTES.profile)
  },
  updateProfile(input: UpdateProfileInput) {
    return request<SiteProfile>(API_ROUTES.profile, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },
  getMe() {
    return request<MeResponse>(API_ROUTES.auth.me)
  },
  logout() {
    return request<{ ok: boolean }>(API_ROUTES.auth.logout, {
      method: 'POST',
    })
  },
}

export { ApiError }
