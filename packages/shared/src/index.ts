export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category: Category | null;
  tags: Tag[];
}

export interface PostDetail extends PostSummary {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
}

export const API_ROUTES = {
  posts: '/posts',
  postBySlug: (slug: string) => `/posts/${slug}`,
  categories: '/categories',
  categoryPosts: (slug: string) => `/categories/${slug}/posts`,
  tags: '/tags',
  tagPosts: (slug: string) => `/tags/${slug}/posts`,
  health: '/health',
} as const;

/** 前端页面路由（React Router），与 API 路径分离 */
export const WEB_ROUTES = {
  home: '/',
  profile: '/profile',
  post: (slug: string) => `/posts/${slug}`,
  category: (slug: string) => `/categories/${slug}`,
  tag: (slug: string) => `/tags/${slug}`,
} as const;
