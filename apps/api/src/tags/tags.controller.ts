import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsQueryDto } from '../common/posts-query.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':slug/posts')
  findPosts(@Param('slug') slug: string, @Query() query: PostsQueryDto) {
    return this.tagsService.findPostsBySlug(slug, query);
  }
}
