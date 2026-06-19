import { PostDetailPage } from '@/views/post-detail-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <PostDetailPage slug={slug} />
}
