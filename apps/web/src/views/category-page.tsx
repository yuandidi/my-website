'use client'

import { useState } from 'react'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { useCategories, useCategoryPosts } from '@/hooks/usePosts'

interface CategoryPageProps {
  slug: string
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const [page, setPage] = useState(1)
  const { data: categories } = useCategories()
  const { data, isLoading, isError, error, refetch } = useCategoryPosts(slug, {
    page,
    limit: 6,
  })

  const categoryName =
    categories?.find((category) => category.slug === slug)?.name ?? slug

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          分类：{categoryName}
        </h1>
      </div>

      {isLoading && <PostListSkeleton />}
      {isError && (
        <QueryError
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      )}
      {data && (
        <>
          <div className="space-y-4">
            {data.data.length === 0 ? (
              <p className="text-muted-foreground">暂无文章</p>
            ) : (
              data.data.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
