import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { useTagPosts, useTags } from '@/hooks/usePosts'

export function TagPage() {
  const { slug = '' } = useParams()
  const [page, setPage] = useState(1)
  const { data: tags } = useTags()
  const { data, isLoading, isError, error, refetch } = useTagPosts(slug, {
    page,
    limit: 6,
  })

  const tagName = tags?.find((tag) => tag.slug === slug)?.name ?? slug

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          标签：{tagName}
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
