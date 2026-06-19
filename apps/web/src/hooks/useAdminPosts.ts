import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  AdminPostDetail,
  CreateCategoryInput,
  CreatePostInput,
  CreateTagInput,
  PostsQueryParams,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateTagInput,
} from '@my-blog/shared'
import { api } from '@/lib/api'

export function useAdminPosts(params?: PostsQueryParams) {
  return useQuery({
    queryKey: ['admin-posts', params],
    queryFn: () => api.getAdminPosts(params),
    staleTime: 30_000,
  })
}

export function useAdminPost(slug: string) {
  return useQuery({
    queryKey: ['admin-post', slug],
    queryFn: () => api.getPost(slug) as Promise<AdminPostDetail>,
    enabled: Boolean(slug),
    staleTime: 30_000,
  })
}

export function usePostMutations() {
  const queryClient = useQueryClient()

  const invalidatePosts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
      queryClient.invalidateQueries({ queryKey: ['posts'] }),
      queryClient.invalidateQueries({ queryKey: ['site-meta'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['tags'] }),
    ])
  }

  const createPost = useMutation({
    mutationFn: (input: CreatePostInput) => api.createPost(input),
    onSuccess: invalidatePosts,
  })

  const updatePost = useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdatePostInput }) =>
      api.updatePost(slug, input),
    onSuccess: async (_data, variables) => {
      await invalidatePosts()
      await queryClient.invalidateQueries({
        queryKey: ['admin-post', variables.slug],
      })
      await queryClient.invalidateQueries({
        queryKey: ['post', variables.slug],
      })
    },
  })

  const deletePost = useMutation({
    mutationFn: (slug: string) => api.deletePost(slug),
    onSuccess: invalidatePosts,
  })

  return { createPost, updatePost, deletePost }
}

export function useTaxonomyMutations() {
  const queryClient = useQueryClient()

  const invalidateTaxonomy = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
      queryClient.invalidateQueries({ queryKey: ['tags'] }),
      queryClient.invalidateQueries({ queryKey: ['site-meta'] }),
    ])
  }

  const createCategory = useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    onSuccess: invalidateTaxonomy,
  })

  const updateCategory = useMutation({
    mutationFn: ({
      slug,
      input,
    }: {
      slug: string
      input: UpdateCategoryInput
    }) => api.updateCategory(slug, input),
    onSuccess: invalidateTaxonomy,
  })

  const deleteCategory = useMutation({
    mutationFn: (slug: string) => api.deleteCategory(slug),
    onSuccess: invalidateTaxonomy,
  })

  const createTag = useMutation({
    mutationFn: (input: CreateTagInput) => api.createTag(input),
    onSuccess: invalidateTaxonomy,
  })

  const updateTag = useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: UpdateTagInput }) =>
      api.updateTag(slug, input),
    onSuccess: invalidateTaxonomy,
  })

  const deleteTag = useMutation({
    mutationFn: (slug: string) => api.deleteTag(slug),
    onSuccess: invalidateTaxonomy,
  })

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
  }
}
