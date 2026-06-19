import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { useCategories, useCategoryPosts } from '@/hooks/usePosts'

export function CategoryPage() {
  const { slug = '' } = useParams()
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
        <h1 className="text-3xl font-bold tracking-tight">
          分类：{categoryName}
        </h1>
        <p className="mt-2 text-muted-foreground">该分类下的全部文章</p>
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
