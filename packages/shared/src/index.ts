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
  tags: Tag[];
}

export interface PostDetail extends PostSummary {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface AdminPostSummary extends PostSummary {
  status: PostStatus;
}

export interface AdminPostDetail extends PostDetail {
  status: PostStatus;
  tagIds: string[];
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status?: PostStatus;
  tagIds?: string[];
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  status?: PostStatus;
  tagIds?: string[];
}

export interface CreateTagInput {
  name: string;
  slug?: string;
}

export interface UpdateTagInput {
  name?: string;
  slug?: string;
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
  tag?: string;
}

export type UserRole = 'USER' | 'DEVELOPER' | 'ADMIN';

export interface ProfileLink {
  label: string;
  href: string;
}

export interface SiteProfile {
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  links: ProfileLink[];
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  githubLogin: string;
  role: UserRole;
}

export interface MeResponse {
  user: AuthUser;
}

export interface SiteMetaResponse {
  user: AuthUser | null;
  tags: Tag[];
}

export interface UpdateProfileInput {
  name?: string;
  title?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  links?: ProfileLink[];
}

export const API_ROUTES = {
  posts: '/posts',
  postsAdmin: '/posts/admin',
  postBySlug: (slug: string) => `/posts/${slug}`,
  tags: '/tags',
  tagBySlug: (slug: string) => `/tags/${slug}`,
  tagPosts: (slug: string) => `/tags/${slug}/posts`,
  health: '/health',
  siteMeta: '/site-meta',
  profile: '/profile',
  auth: {
    github: '/auth/github',
    githubCallback: '/auth/github/callback',
    logout: '/auth/logout',
    me: '/auth/me',
  },
} as const;

/** 前端页面路由，与 API 路径分离 */
export const WEB_ROUTES = {
  home: '/',
  blog: '/blog',
  profile: '/profile',
  profileEdit: '/profile/edit',
  postsAdmin: '/admin/posts',
  postNew: '/admin/posts/new',
  postEdit: (slug: string) => `/admin/posts/${slug}/edit`,
  post: (slug: string) => `/posts/${slug}`,
  tag: (slug: string) => `/tags/${slug}`,
} as const;

export { validateUpdateProfileInput } from './profile-validation';
export {
  validateCreatePostInput,
  validateCreateTagInput,
  validateUpdatePostInput,
  validateUpdateTagInput,
} from './post-validation';
