import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, PaginatedResponse, PostSummary } from '@my-blog/shared';
import { CacheService } from '../cache/cache.service';
import { PostsQueryDto } from '../common/posts-query.dto';
import {
  mapPostSummary,
  postInclude,
  publishedPostWhere,
} from '../common/post.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.cache.wrap('categories:all', 1800, async () => {
      return this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      });
    });
  }

  async findPostsBySlug(
    slug: string,
    query: PostsQueryDto,
  ): Promise<PaginatedResponse<PostSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    const where = {
      ...publishedPostWhere(),
      categoryId: category.id,
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: postInclude,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map(mapPostSummary),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
