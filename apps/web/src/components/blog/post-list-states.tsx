import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface PostListSkeletonProps {
  count?: number
}

export function PostListSkeleton({ count = 3 }: PostListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-border p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

interface QueryErrorProps {
  message?: string
  onRetry?: () => void
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        {message ?? '加载失败，请稍后重试'}
      </p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          重试
        </Button>
      )}
    </div>
  )
}
