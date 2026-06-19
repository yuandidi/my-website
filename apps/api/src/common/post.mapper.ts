import { PostStatus, Prisma } from '@prisma/client';

export const publishedPostWhere = (): Prisma.PostWhereInput => ({
  status: PostStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
});

export const postInclude = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.PostInclude;

export function mapPostSummary(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
}) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    category: post.category,
    tags: post.tags.map(({ tag }) => tag),
  };
}

export function mapPostDetail(
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: { id: string; name: string; slug: string } | null;
    tags: { tag: { id: string; name: string; slug: string } }[];
  },
) {
  return {
    ...mapPostSummary(post),
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
