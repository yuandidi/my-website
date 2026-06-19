import { Link } from 'react-router-dom'
import type { PostSummary } from '@my-blog/shared'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {post.category && (
            <Link to={`/categories/${post.category.slug}`}>
              <Badge variant="secondary">{post.category.name}</Badge>
            </Link>
          )}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>
        <CardTitle>
          <Link
            to={`/posts/${post.slug}`}
            className="transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        {post.excerpt && <CardDescription>{post.excerpt}</CardDescription>}
      </CardHeader>
      {post.tags.length > 0 && (
        <CardContent className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link key={tag.id} to={`/tags/${tag.slug}`}>
              <Badge variant="outline">{tag.name}</Badge>
            </Link>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
