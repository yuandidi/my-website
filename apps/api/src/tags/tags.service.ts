import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, PostSummary, Tag } from '@my-blog/shared';
import { CacheService } from '../cache/cache.service';
import { PostsQueryDto } from '../common/posts-query.dto';
import { mapPostSummary, postInclude, publishedPostWhere } from '../common/post.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.cache.wrap('tags:all', 1800, async () => {
      return this.prisma.tag.findMany({
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

    const tag = await this.prisma.tag.findUnique({ where: { slug } });
    if (!tag) {
      throw new NotFoundException(`Tag "${slug}" not found`);
    }

    const where = {
      ...publishedPostWhere(),
      tags: { some: { tagId: tag.id } },
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
