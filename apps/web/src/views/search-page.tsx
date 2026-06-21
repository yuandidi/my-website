'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { normalizeSearchQuery, WEB_ROUTES } from '@my-blog/shared'
import { PostCard } from '@/components/blog/post-card'
import {
  PostListSkeleton,
  QueryError,
} from '@/components/blog/post-list-states'
import { Pagination } from '@/components/blog/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchPosts } from '@/hooks/usePosts'

interface SearchFormProps {
  initialQuery: string
}

function SearchForm({ initialQuery }: SearchFormProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState(initialQuery)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextQuery = normalizeSearchQuery(inputValue)
    if (!nextQuery) {
      return
    }

    router.replace(`${WEB_ROUTES.search}?q=${encodeURIComponent(nextQuery)}`)
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="搜索标题或摘要…"
        aria-label="搜索关键词"
        maxLength={100}
      />
      <Button type="submit" disabled={!normalizeSearchQuery(inputValue)}>
        <Search className="size-4" aria-hidden />
        搜索
      </Button>
    </form>
  )
}

interface SearchResultsProps {
  query: string
}

function SearchResults({ query }: SearchResultsProps) {
  const normalizedQuery = normalizeSearchQuery(query || undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, refetch } = useSearchPosts(
    normalizedQuery ? { q: normalizedQuery, page, limit: 10 } : null,
  )

  if (!normalizedQuery) {
    return null
  }

  if (isLoading) {
    return <PostListSkeleton />
  }

  if (isError) {
    return (
      <QueryError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data) {
    return null
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {data.meta.total > 0
          ? `找到 ${data.meta.total} 篇与「${normalizedQuery}」相关的文章`
          : `没有找到与「${normalizedQuery}」相关的文章`}
      </p>
      <div className="space-y-4">
        {data.data.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {data.meta.totalPages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </>
  )
}

export function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const normalizedQuery = normalizeSearchQuery(query || undefined)

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-4">
        <h1 className="fantasy-section-divider text-3xl font-bold text-gold">
          搜索
        </h1>
        <SearchForm key={query} initialQuery={query} />
        {!normalizedQuery && (
          <p className="text-sm text-muted-foreground">
            输入关键词，在已发布文章的标题与摘要中查找。
          </p>
        )}
      </div>

      <SearchResults key={query} query={query} />
    </div>
  )
}
