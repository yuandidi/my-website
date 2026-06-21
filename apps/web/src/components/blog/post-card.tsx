'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import type { PostSummary } from '@my-blog/shared'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: PostSummary
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function formatViewCount(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

interface ViewCountBadgeProps {
  count: number
  className?: string
  overlay?: boolean
}

function ViewCountBadge({ count, className, overlay }: ViewCountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        overlay
          ? 'rounded-none border border-gold/40 bg-background/90 px-2 py-1 text-muted-foreground backdrop-blur-sm fantasy-pixel-shadow-sm'
          : 'text-muted-foreground',
        className,
      )}
      aria-label={`${formatViewCount(count)} 次阅读`}
    >
      <Eye className="size-3.5 shrink-0" aria-hidden />
      <span>{formatViewCount(count)}</span>
    </span>
  )
}

export function PostCard({ post }: PostCardProps) {
  const postHref = WEB_ROUTES.post(post.slug)

  return (
    <FantasyScroll className="transition-shadow hover:shadow-lg hover:shadow-primary/10">
      <div className="space-y-3">
        <Link
          href={postHref}
          className="group block space-y-3 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {post.coverImage ? (
            <span className="relative block overflow-hidden rounded-none border-2 border-gold/30">
              <img
                src={post.coverImage}
                alt=""
                className="aspect-[16/9] w-full object-cover transition-transform image-pixelated group-hover:scale-[1.02]"
              />
              <span className="absolute bottom-2 right-2">
                <ViewCountBadge count={post.viewCount} overlay />
              </span>
            </span>
          ) : null}

          <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            {!post.coverImage && <ViewCountBadge count={post.viewCount} />}
          </span>

          <span className="block font-display text-xl leading-snug text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </span>

          {post.excerpt ? (
            <span className="block text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </span>
          ) : null}
        </Link>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={WEB_ROUTES.tag(tag.slug)}
                className="relative z-10 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Badge variant="spell">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FantasyScroll>
  )
}
