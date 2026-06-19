import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, PostDetail, PostSummary } from '@my-blog/shared';
import { Prisma } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { PostsQueryDto } from '../common/posts-query.dto';
import {
  mapPostDetail,
  mapPostSummary,
  postInclude,
  publishedPostWhere,
} from '../common/post.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  private buildListWhere(query: PostsQueryDto): Prisma.PostWhereInput {
    const where: Prisma.PostWhereInput = { ...publishedPostWhere() };

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.tag) {
      where.tags = { some: { tag: { slug: query.tag } } };
    }

    return where;
  }

  private listCacheKey(query: PostsQueryDto) {
    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex');
    return `posts:list:${hash}`;
  }

  async findAll(query: PostsQueryDto): Promise<PaginatedResponse<PostSummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.cache.wrap(
      this.listCacheKey({ ...query, page, limit }),
      300,
      async () => {
        const where = this.buildListWhere(query);

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
      },
    );
  }

  async findBySlug(slug: string): Promise<PostDetail> {
    return this.cache.wrap(`posts:slug:${slug}`, 600, async () => {
      const post = await this.prisma.post.findFirst({
        where: { slug, ...publishedPostWhere() },
        include: postInclude,
      });

      if (!post) {
        throw new NotFoundException(`Post "${slug}" not found`);
      }

      return mapPostDetail(post);
    });
  }
}
