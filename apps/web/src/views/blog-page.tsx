'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { PostTagFilter } from '@/components/blog/post-tag-filter'
import { Pagination } from '@/components/blog/pagination'
import { usePosts, useTags } from '@/hooks/usePosts'
import { track } from '@/lib/analytics'

export function BlogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag')
  const pageKey = selectedTag ?? '__all__'
  const [pageByTag, setPageByTag] = useState<Record<string, number>>({})
  const page = pageByTag[pageKey] ?? 1

  const setPage = (nextPage: number) => {
    setPageByTag((current) => ({ ...current, [pageKey]: nextPage }))
  }

  const { data: tags } = useTags()
  const { data, isLoading, isError, error, refetch } = usePosts({
    page,
    limit: 6,
    tag: selectedTag ?? undefined,
  })

  const activeTagName = tags?.find((tag) => tag.slug === selectedTag)?.name

  function handleTagSelect(slug: string | null) {
    if (slug) {
      track('tag_filter', { slug })
    }

    const params = new URLSearchParams(searchParams.toString())

    if (slug) {
      params.set('tag', slug)
    } else {
      params.delete('tag')
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-4">
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          {activeTagName ? `Blog · ${activeTagName}` : 'Blog'}
        </h1>
        {tags && (
          <PostTagFilter
            tags={tags}
            selectedSlug={selectedTag}
            onSelect={handleTagSelect}
          />
        )}
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
