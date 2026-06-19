import { PostEditPage } from '@/views/post-edit-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <PostEditPage mode="edit" slug={slug} />
}
