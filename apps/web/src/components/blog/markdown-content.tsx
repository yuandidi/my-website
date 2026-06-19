'use client'

import { lazy, Suspense } from 'react'

const LazyMarkdownRenderer = lazy(() =>
  import('./markdown-renderer').then((module) => ({
    default: module.MarkdownRenderer,
  })),
)

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">内容加载中…</p>}>
      <LazyMarkdownRenderer content={content} />
    </Suspense>
  )
}
