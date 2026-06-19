import { useState } from 'react'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { TagCloud } from '@/components/layout/tag-cloud'
import { usePosts, useTags } from '@/hooks/usePosts'

export function HomePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = usePosts({ page, limit: 6 })
  const { data: tags } = useTags()

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_240px]">
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">最新文章</h1>
          <p className="mt-2 text-muted-foreground">
            记录技术探索与生活随笔
          </p>
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
              {data.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {tags && tags.length > 0 && <TagCloud tags={tags} />}
    </div>
  )
}
