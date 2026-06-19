import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsQueryDto } from '../common/posts-query.dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug/posts')
  findPosts(@Param('slug') slug: string, @Query() query: PostsQueryDto) {
    return this.categoriesService.findPostsBySlug(slug, query);
  }
}
