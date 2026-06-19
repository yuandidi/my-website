import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPool } from './db';

export async function applySchema() {
  const sql = readFileSync(resolve(__dirname, '../scripts/schema.sql'), 'utf8');
  await getPool().query(sql);
}

function id() {
  return crypto.randomUUID();
}

export async function seedDatabase() {
  const pool = getPool();
  const now = new Date();

  await pool.query('DELETE FROM "PostTag"');
  await pool.query('DELETE FROM "Post"');
  await pool.query('DELETE FROM "Tag"');
  await pool.query('DELETE FROM "Category"');

  const categories = {
    tech: { id: id(), name: '技术', slug: 'tech' },
    life: { id: id(), name: '生活', slug: 'life' },
    notes: { id: id(), name: '随笔', slug: 'notes' },
  };

  for (const category of Object.values(categories)) {
    await pool.query(
      `INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $4)`,
      [category.id, category.name, category.slug, now],
    );
  }

  const tags = {
    react: { id: id(), name: 'React', slug: 'react' },
    nest: { id: id(), name: 'NestJS', slug: 'nestjs' },
    ts: { id: id(), name: 'TypeScript', slug: 'typescript' },
    prisma: { id: id(), name: 'Prisma', slug: 'prisma' },
    redis: { id: id(), name: 'Redis', slug: 'redis' },
    daily: { id: id(), name: '日常', slug: 'daily' },
  };

  for (const tag of Object.values(tags)) {
    await pool.query(
      `INSERT INTO "Tag" (id, name, slug, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $4)`,
      [tag.id, tag.name, tag.slug, now],
    );
  }

  const posts = [
    {
      title: '用 React + Vite 搭建现代前端',
      slug: 'react-vite-modern-frontend',
      excerpt: '从零开始用 React 19 与 Vite 构建类型安全、可扩展的前端应用。',
      categoryId: categories.tech.id,
      tagIds: [tags.react.id, tags.ts.id],
      content:
        '## 为什么选择 React + Vite\n\nVite 提供极速的冷启动与热更新体验，配合 React 19 可以轻松构建现代化博客前台。',
    },
    {
      title: 'NestJS 模块化架构实践',
      slug: 'nestjs-modular-architecture',
      excerpt: '探索 NestJS 模块划分、依赖注入与可测试性设计。',
      categoryId: categories.tech.id,
      tagIds: [tags.nest.id, tags.ts.id],
      content:
        '## NestJS 架构概览\n\nNestJS 借鉴 Angular 的模块化思想，将业务按功能域拆分为独立 Module。',
    },
    {
      title: 'Prisma 与 PostgreSQL 数据建模',
      slug: 'prisma-postgresql-modeling',
      excerpt: '使用 Prisma Schema 定义文章、分类、标签关系，并一键迁移。',
      categoryId: categories.tech.id,
      tagIds: [tags.prisma.id, tags.ts.id],
      content:
        '## 数据模型设计\n\n博客核心实体包括 Post、Category、Tag，通过 PostTag 实现多对多关联。',
    },
    {
      title: 'Redis 缓存策略：Cache-Aside 模式',
      slug: 'redis-cache-aside-pattern',
      excerpt: '为文章列表与详情接口添加 Redis 缓存，显著降低数据库压力。',
      categoryId: categories.tech.id,
      tagIds: [tags.redis.id, tags.nest.id],
      content:
        '## Cache-Aside 工作流程\n\n1. 读取时先查 Redis\n2. 命中则直接返回\n3. 未命中则查数据库并回填缓存',
    },
    {
      title: 'TanStack Query 数据获取最佳实践',
      slug: 'tanstack-query-best-practices',
      excerpt: '用 TanStack Query 管理服务端状态，告别重复的 loading 与 error 处理。',
      categoryId: categories.tech.id,
      tagIds: [tags.react.id, tags.ts.id],
      content:
        '## 为什么用 TanStack Query\n\n服务端状态与 UI 状态应分开管理。TanStack Query 提供自动缓存与重新验证。',
    },
    {
      title: '周末散步：城市里的小事',
      slug: 'weekend-walk-city-moments',
      excerpt: '记录一次没有目的的散步，发现城市里被忽略的美好细节。',
      categoryId: categories.life.id,
      tagIds: [tags.daily.id],
      content:
        '## 没有目的的出发\n\n周末早晨，阳光正好。不带地图，不设终点，只是沿着河岸一直走。',
    },
    {
      title: '写作是一种思考方式',
      slug: 'writing-as-thinking',
      excerpt: '为什么坚持写作？因为落笔的过程就是梳理思路的过程。',
      categoryId: categories.notes.id,
      tagIds: [tags.daily.id],
      content:
        '## 写作 ≠ 记录\n\n很多人把写作当作事后的记录，但其实 **写作即思考**。',
    },
    {
      title: '全栈博客 Monorepo 项目启动记',
      slug: 'fullstack-blog-monorepo-kickoff',
      excerpt: '记录这个博客项目的技术选型与 Monorepo 结构设计。',
      categoryId: categories.notes.id,
      tagIds: [tags.react.id, tags.nest.id, tags.prisma.id, tags.redis.id],
      content:
        '## 技术栈\n\n- **前端**：React + Vite + TypeScript\n- **后端**：Vercel Serverless + Postgres',
    },
  ];

  for (const [index, post] of posts.entries()) {
    const publishedAt = new Date(now);
    publishedAt.setDate(publishedAt.getDate() - index);
    const postId = id();

    await pool.query(
      `INSERT INTO "Post" (
        id, title, slug, excerpt, content, status, "publishedAt", "categoryId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, 'PUBLISHED', $6, $7, $8, $8)`,
      [
        postId,
        post.title,
        post.slug,
        post.excerpt,
        post.content,
        publishedAt,
        post.categoryId,
        now,
      ],
    );

    for (const tagId of post.tagIds) {
      await pool.query(
        `INSERT INTO "PostTag" ("postId", "tagId") VALUES ($1, $2)`,
        [postId, tagId],
      );
    }
  }

  return {
    categories: Object.keys(categories).length,
    tags: Object.keys(tags).length,
    posts: posts.length,
  };
}
