import { Link } from 'react-router-dom'
import type { PostSummary } from '@my-blog/shared'
import { WEB_ROUTES } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'

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

export function PostCard({ post }: PostCardProps) {
  return (
    <FantasyScroll className="transition-shadow hover:shadow-lg hover:shadow-primary/10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {post.category && (
            <Link to={WEB_ROUTES.category(post.category.slug)}>
              <Badge variant="guild">{post.category.name}</Badge>
            </Link>
          )}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>
        <h2 className="font-display text-xl leading-snug">
          <Link
            to={WEB_ROUTES.post(post.slug)}
            className="text-foreground transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={WEB_ROUTES.tag(tag.slug)}>
                <Badge variant="spell">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FantasyScroll>
  )
}
