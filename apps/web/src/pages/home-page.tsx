import { useState } from 'react'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { FantasyWorldMap } from '@/components/layout/fantasy-world-map'
import { TagCloud } from '@/components/layout/tag-cloud'
import { usePosts, useTags } from '@/hooks/usePosts'

export function HomePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = usePosts({ page, limit: 6 })
  const { data: tags } = useTags()

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <FantasyWorldMap />

      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <section className="space-y-6">
          <div>
            <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
              冒险日志
            </h1>
            <p className="mt-3 text-muted-foreground">
              港口公告板 — 最新卷轴摘录
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
    </div>
  )
}
