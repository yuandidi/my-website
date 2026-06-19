import { Suspense } from 'react'
import { BlogPage } from '@/views/blog-page'

export default function Page() {
  return (
    <Suspense>
      <BlogPage />
    </Suspense>
  )
}
