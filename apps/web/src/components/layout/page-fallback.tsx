import { Skeleton } from '@/components/ui/skeleton'

export function PageFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
