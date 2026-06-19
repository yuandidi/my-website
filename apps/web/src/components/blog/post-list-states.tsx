import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'

interface PostListSkeletonProps {
  count?: number
}

export function PostListSkeleton({ count = 3 }: PostListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FantasyScroll key={index}>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </FantasyScroll>
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
    <FantasyScroll innerClassName="text-center">
      <p className="font-display text-gold">加载失败</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? '请稍后重试'}
      </p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          重试
        </Button>
      )}
    </FantasyScroll>
  )
}
