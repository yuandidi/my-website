import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/site-header'
import { CategoryPage } from '@/pages/category-page'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { PostDetailPage } from '@/pages/post-detail-page'
import { TagPage } from '@/pages/tag-page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen">
          <SiteHeader />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts/:slug" element={<PostDetailPage />} />
              <Route path="/categories/:slug" element={<CategoryPage />} />
              <Route path="/tags/:slug" element={<TagPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
