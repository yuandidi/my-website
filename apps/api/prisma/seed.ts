import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();

  const tech = await prisma.category.create({
    data: { name: '技术', slug: 'tech' },
  });
  const life = await prisma.category.create({
    data: { name: '生活', slug: 'life' },
  });
  const notes = await prisma.category.create({
    data: { name: '随笔', slug: 'notes' },
  });

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
    prisma.tag.create({ data: { name: 'NestJS', slug: 'nestjs' } }),
    prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.create({ data: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.create({ data: { name: 'Redis', slug: 'redis' } }),
    prisma.tag.create({ data: { name: '日常', slug: 'daily' } }),
  ]);

  const [reactTag, nestTag, tsTag, prismaTag, redisTag, dailyTag] = tags;

  const posts = [
    {
      title: '用 React + Vite 搭建现代前端',
      slug: 'react-vite-modern-frontend',
      excerpt: '从零开始用 React 19 与 Vite 构建类型安全、可扩展的前端应用。',
      categoryId: tech.id,
      tagIds: [reactTag.id, tsTag.id],
      content: `## 为什么选择 React + Vite

Vite 提供极速的冷启动与热更新体验，配合 React 19 可以轻松构建现代化博客前台。

### 核心优势

- **开发体验**：毫秒级 HMR
- **类型安全**：TypeScript 全覆盖
- **生态丰富**：TanStack Query、React Router 等成熟方案

\`\`\`tsx
function App() {
  return <h1>Hello Blog</h1>;
}
\`\`\`

开始你的第一个组件吧！`,
    },
    {
      title: 'NestJS 模块化架构实践',
      slug: 'nestjs-modular-architecture',
      excerpt: '探索 NestJS 模块划分、依赖注入与可测试性设计。',
      categoryId: tech.id,
      tagIds: [nestTag.id, tsTag.id],
      content: `## NestJS 架构概览

NestJS 借鉴 Angular 的模块化思想，将业务按功能域拆分为独立 Module。

### 推荐模块划分

1. **PrismaModule** — 数据库访问
2. **RedisModule** — 缓存与会话
3. **PostsModule** — 文章业务

每个模块包含 Controller、Service，职责清晰，便于二期扩展认证与后台管理。`,
    },
    {
      title: 'Prisma 与 PostgreSQL 数据建模',
      slug: 'prisma-postgresql-modeling',
      excerpt: '使用 Prisma Schema 定义文章、分类、标签关系，并一键迁移。',
      categoryId: tech.id,
      tagIds: [prismaTag.id, tsTag.id],
      content: `## 数据模型设计

博客核心实体包括 Post、Category、Tag，通过 PostTag 实现多对多关联。

### 发布状态

使用 \`PostStatus\` 枚举区分草稿与已发布文章，公开 API 仅返回 \`PUBLISHED\` 状态的内容。

> 好的数据模型是后续搜索、评论等功能的基础。`,
    },
    {
      title: 'Redis 缓存策略：Cache-Aside 模式',
      slug: 'redis-cache-aside-pattern',
      excerpt: '为文章列表与详情接口添加 Redis 缓存，显著降低数据库压力。',
      categoryId: tech.id,
      tagIds: [redisTag.id, nestTag.id],
      content: `## Cache-Aside 工作流程

1. 读取时先查 Redis
2. 命中则直接返回
3. 未命中则查数据库并回填缓存

### TTL 建议

| 数据类型 | TTL |
|---------|-----|
| 文章列表 | 5 分钟 |
| 文章详情 | 10 分钟 |
| 分类/标签 | 30 分钟 |

二期可在写操作后主动失效相关缓存 Key。`,
    },
    {
      title: 'TanStack Query 数据获取最佳实践',
      slug: 'tanstack-query-best-practices',
      excerpt: '用 TanStack Query 管理服务端状态，告别重复的 loading 与 error 处理。',
      categoryId: tech.id,
      tagIds: [reactTag.id, tsTag.id],
      content: `## 为什么用 TanStack Query

服务端状态与 UI 状态应分开管理。TanStack Query 提供：

- 自动缓存与重新验证
- 分页与无限滚动支持
- 声明式 loading / error 状态

\`\`\`ts
const { data, isLoading } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => fetchPosts({ page }),
});
\`\`\``,
    },
    {
      title: '周末散步：城市里的小事',
      slug: 'weekend-walk-city-moments',
      excerpt: '记录一次没有目的的散步，发现城市里被忽略的美好细节。',
      categoryId: life.id,
      tagIds: [dailyTag.id],
      content: `## 没有目的的出发

周末早晨，阳光正好。不带地图，不设终点，只是沿着河岸一直走。

路过旧书店、街角咖啡香、孩童的笑声——这些细碎的瞬间，构成了生活的底色。

*慢下来，才能看见。*`,
    },
    {
      title: '写作是一种思考方式',
      slug: 'writing-as-thinking',
      excerpt: '为什么坚持写作？因为落笔的过程就是梳理思路的过程。',
      categoryId: notes.id,
      tagIds: [dailyTag.id],
      content: `## 写作 ≠ 记录

很多人把写作当作事后的记录，但其实 **写作即思考**。

当你试图把模糊的想法写成文字，逻辑漏洞会自然浮现。这就是为什么工程师应该写作——不是为了成为作家，而是为了更清晰地思考。

> 如果你说不清楚，说明你还没想清楚。`,
    },
    {
      title: '全栈博客 Monorepo 项目启动记',
      slug: 'fullstack-blog-monorepo-kickoff',
      excerpt: '记录这个博客项目的技术选型与 Monorepo 结构设计。',
      categoryId: notes.id,
      tagIds: [reactTag.id, nestTag.id, prismaTag.id, redisTag.id],
      content: `## 技术栈

- **前端**：React + Vite + TypeScript + TanStack Query + shadcn/ui
- **后端**：NestJS + Prisma + Redis + PostgreSQL
- **架构**：pnpm Monorepo

## 第一期目标

先完成前台公开展示，通过 Seed 数据驱动内容，二期再接入认证与后台管理。

欢迎常来看看更新！`,
    },
  ];

  const now = new Date();

  for (const [index, post] of posts.entries()) {
    const publishedAt = new Date(now);
    publishedAt.setDate(publishedAt.getDate() - index);

    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: PostStatus.PUBLISHED,
        publishedAt,
        categoryId: post.categoryId,
        tags: {
          create: post.tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  }

  console.log('Seed completed: 3 categories, 6 tags, 8 posts');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
