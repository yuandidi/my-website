import { TagPage } from '@/views/tag-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <TagPage slug={slug} />
}
