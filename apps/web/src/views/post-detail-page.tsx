'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { WEB_ROUTES } from '@my-blog/shared'
import { GiscusComments } from '@/components/blog/giscus-comments'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryError } from '@/components/blog/post-list-states'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { usePost } from '@/hooks/usePosts'
import { track } from '@/lib/analytics'

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

interface PostDetailPageProps {
  slug: string
}

export function PostDetailPage({ slug }: PostDetailPageProps) {
  const { data: post, isLoading, isError, error, refetch } = usePost(slug)
  const postSlug = post?.slug
  const postTitle = post?.title

  useEffect(() => {
    if (!postSlug) {
      return
    }

    track('post_view', { slug: postSlug, title: postTitle ?? '' })
  }, [postSlug, postTitle])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <QueryError
          message={error instanceof Error ? error.message : '文章不存在'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href={WEB_ROUTES.home}>返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <FantasyScroll innerClassName="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          </div>
          <h1 className="font-display text-4xl leading-tight text-gold">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={WEB_ROUTES.tag(tag.slug)}>
                  <Badge variant="spell">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="prose-fantasy">
          <MarkdownContent content={post.content} />
        </div>
      </FantasyScroll>

      <GiscusComments />

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href={WEB_ROUTES.home}>返回首页</Link>
        </Button>
      </div>
    </article>
  )
}
