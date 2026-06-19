'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-display text-xl">页面出错了</h1>
      <p className="text-sm text-muted-foreground">请稍后重试</p>
      <Button type="button" onClick={() => reset()}>
        重试
      </Button>
    </div>
  )
}
