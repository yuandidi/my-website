import {
  API_ROUTES,
  type Category,
  type PaginatedResponse,
  type PostDetail,
  type PostSummary,
  type PostsQueryParams,
  type Tag,
} from '@my-blog/shared'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
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
}
