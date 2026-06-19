import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { CacheModule } from './cache/cache.module';
import { CategoriesModule } from './categories/categories.module';
import { HealthModule } from './health/health.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '../../.env'),
        resolve(process.cwd(), '.env'),
      ],
    }),
    PrismaModule,
    RedisModule,
    CacheModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    HealthModule,
  ],
})
export class AppModule {}
