import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PostsQueryParams, PostsSearchParams } from '@my-blog/shared'
import { api } from '@/lib/api'

export function usePosts(params?: PostsQueryParams) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.getPosts(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.getPost(slug),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(slug),
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => api.getTags(),
    staleTime: 30 * 60 * 1000,
  })
}

export function useTagPosts(slug: string, params?: PostsQueryParams) {
  return useQuery({
    queryKey: ['tag-posts', slug, params],
    queryFn: () => api.getTagPosts(slug, params),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
  })
}

export function useSearchPosts(params: PostsSearchParams | null) {
  return useQuery({
    queryKey: ['search-posts', params],
    queryFn: () => api.searchPosts(params!),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(params?.q.trim()),
  })
}
