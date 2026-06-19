import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-provider'
import { PageFallback } from '@/components/layout/page-fallback'
import { SiteHeader } from '@/components/layout/site-header'
import { HomePage } from '@/pages/home-page'

const ProfilePage = lazy(() =>
  import('@/pages/profile-page').then((module) => ({ default: module.ProfilePage })),
)
const ProfileEditPage = lazy(() =>
  import('@/pages/profile-edit-page').then((module) => ({
    default: module.ProfileEditPage,
  })),
)
const PostDetailPage = lazy(() =>
  import('@/pages/post-detail-page').then((module) => ({
    default: module.PostDetailPage,
  })),
)
const CategoryPage = lazy(() =>
  import('@/pages/category-page').then((module) => ({ default: module.CategoryPage })),
)
const TagPage = lazy(() =>
  import('@/pages/tag-page').then((module) => ({ default: module.TagPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })),
)

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
      <AuthProvider>
        <BrowserRouter>
          <div className="fantasy-bg min-h-screen">
            <SiteHeader />
            <main>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/edit" element={<ProfileEditPage />} />
                  <Route path="/posts/:slug" element={<PostDetailPage />} />
                  <Route path="/categories/:slug" element={<CategoryPage />} />
                  <Route path="/tags/:slug" element={<TagPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
