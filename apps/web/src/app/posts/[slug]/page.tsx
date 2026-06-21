import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WEB_ROUTES } from '@my-blog/shared'
import { getPostBySlug } from '@lib/blog'
import { buildPostDescription, SITE_NAME } from '@lib/seo'
import { PostDetailPage } from '@/views/post-detail-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const post = await getPostBySlug(slug)
    const description = buildPostDescription(post)
    const images = post.coverImage
      ? [{ url: post.coverImage, alt: post.title }]
      : [{ url: '/favicon.png', alt: SITE_NAME }]

    return {
      title: post.title,
      description,
      openGraph: {
        type: 'article',
        title: post.title,
        description,
        url: WEB_ROUTES.post(slug),
        publishedTime: post.publishedAt ?? undefined,
        modifiedTime: post.updatedAt,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: images.map((image) => image.url),
      },
    }
  } catch {
    notFound()
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <PostDetailPage slug={slug} />
}
