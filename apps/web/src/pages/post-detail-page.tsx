import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryError } from '@/components/blog/post-list-states'
import { usePost } from '@/hooks/usePosts'

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export function PostDetailPage() {
  const { slug = '' } = useParams()
  const { data: post, isLoading, isError, error, refetch } = usePost(slug)

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
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {post.category && (
            <Link to={`/categories/${post.category.slug}`}>
              <Badge variant="secondary">{post.category.name}</Badge>
            </Link>
          )}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/tags/${tag.slug}`}>
                <Badge variant="outline">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-10">
        <Button asChild variant="outline">
          <Link to="/">返回首页</Link>
        </Button>
      </div>
    </article>
  )
}
