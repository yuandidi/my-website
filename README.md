# My Blog

Vercel 友好全栈博客：React + Vite 前台，Vercel Serverless Functions + Postgres 后端。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19、Vite、TypeScript、React Router、TanStack Query、shadcn/ui、Tailwind CSS |
| 后端 | Vercel Serverless Functions（`/api`） |
| 数据库 | Vercel Postgres（Neon） |
| 架构 | pnpm Monorepo，**一条命令部署前后端** |

> `apps/api`（NestJS + Redis）保留作本地参考，生产部署不再依赖它。

## 一键部署（推荐）

### 1. 创建 Vercel Postgres

在 [Vercel Dashboard](https://vercel.com) → 项目 → **Storage** → 创建 **Postgres**。

Vercel 会自动注入 `POSTGRES_URL` 环境变量。

### 2. 初始化数据库（本地执行一次）

```bash
pnpm install
cp .env.example .env
# 把 .env 里的 POSTGRES_URL 改成 Vercel Postgres 连接串

pnpm db:setup
```

### 3. 部署

```bash
pnpm deploy:vercel
```

访问 Vercel 分配的域名即可，**前后端同域**，前端默认请求 `/api`，无需配 CORS。

## 本地开发

```bash
pnpm install
cp .env.example .env
pnpm docker:up          # 可选：本地 Postgres
pnpm db:setup
pnpm dev                # vercel dev，同时跑前端 + /api
```

仅跑前端：

```bash
pnpm dev:web
```

## 项目结构

```text
my-blog/
├── api/                # Vercel Serverless API
├── lib/                # 数据库与业务逻辑
├── apps/web/           # React 前台
├── packages/shared/    # 共享类型
└── scripts/            # schema / seed
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表 |
| GET | `/api/posts/:slug` | 文章详情 |
| GET | `/api/categories` | 全部分类 |
| GET | `/api/categories/:slug/posts` | 分类文章 |
| GET | `/api/tags` | 全部标签 |
| GET | `/api/tags/:slug/posts` | 标签文章 |
| GET | `/api/health` | 健康检查 |

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地全栈（vercel dev） |
| `pnpm deploy:vercel` | 生产部署 |
| `pnpm db:setup` | 建表 + 种子数据 |
| `pnpm build` | 仅构建前端 |

## 开发 SOP

任务完成后默认流程：

1. `pnpm build` 验证通过
2. 按模块拆分 git commit（`feat` / `fix` / `docs` / `chore`）
3. `git push` 到 `origin`（`main` 与 `master` 保持同步）

详见仓库内 `.cursor/rules/git-pr.mdc`。

## 二期规划

- 用户认证与后台管理
- 评论系统
- 全文搜索
- Markdown 编辑器
