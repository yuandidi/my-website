# My Blog

全栈博客 Monorepo：React + Vite + TypeScript 前台，NestJS + Prisma + Redis + PostgreSQL 后端。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19、Vite、TypeScript、React Router、TanStack Query、shadcn/ui、Tailwind CSS |
| 后端 | NestJS、Prisma、Redis、PostgreSQL |
| 架构 | pnpm Monorepo（`apps/web`、`apps/api`、`packages/shared`） |

## 环境要求

- Node.js 20+
- pnpm 9+
- Docker Desktop（用于 PostgreSQL 与 Redis）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

### 3. 启动数据库与缓存

```bash
pnpm docker:up
```

等待 PostgreSQL 与 Redis 健康检查通过。

### 4. 数据库迁移与种子数据

```bash
pnpm db:setup
```

### 5. 启动开发服务

```bash
pnpm dev
```

- 前台：http://localhost:5173
- API：http://localhost:3000/api
- 健康检查：http://localhost:3000/api/health

## 项目结构

```text
my-blog/
├── apps/
│   ├── web/          # React 前台
│   └── api/          # NestJS 后端
├── packages/
│   └── shared/       # 共享类型与 API 路由常量
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 并行启动 web + api |
| `pnpm build` | 构建全部包 |
| `pnpm docker:up` | 启动 PostgreSQL + Redis |
| `pnpm docker:down` | 停止容器 |
| `pnpm db:migrate` | 执行 Prisma 迁移 |
| `pnpm db:seed` | 写入示例数据 |
| `pnpm db:setup` | 迁移 + 种子 |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表（`?page&limit&category&tag`） |
| GET | `/api/posts/:slug` | 文章详情 |
| GET | `/api/categories` | 全部分类 |
| GET | `/api/categories/:slug/posts` | 分类下文章 |
| GET | `/api/tags` | 全部标签 |
| GET | `/api/tags/:slug/posts` | 标签下文章 |
| GET | `/api/health` | 服务健康检查 |

## 二期规划

- JWT 认证与后台管理
- 评论系统
- 全文搜索
- Markdown 编辑器
