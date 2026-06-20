# My Blog

Vercel 友好全栈博客：Next.js App Router 全栈，Postgres 后端。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16、React 19、TypeScript、TanStack Query、shadcn/ui、Tailwind CSS |
| API | Next.js Route Handler（`app/api/[[...path]]`） |
| 数据库 | Vercel Postgres（Neon） |
| 架构 | pnpm Monorepo，**一条命令部署前后端** |

> 生产 API 由 Next.js Route Handler（`lib/api-handlers/`）承载，前后端同域部署。

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
pnpm dev:web            # Next.js 16 开发（Turbopack 默认）
```

仅跑前端（含 API Route Handler）：

```bash
pnpm dev:web
```

## 项目结构

```text
my-blog/
├── lib/                # 数据库与业务逻辑、API handlers
├── apps/web/           # Next.js 全栈应用（src/app 路由 + API）
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
| `pnpm dev:web` | 本地开发（Next.js，含 `/api`） |
| `pnpm deploy:vercel` | 生产部署 |
| `pnpm db:setup` | 建表 + 种子数据 |
| `pnpm build` | 构建 shared + web |
| `pnpm check` | 快检：typecheck + lint + test（复现 CI quality job） |
| `pnpm check:full` | 全检：build + lib typecheck + test（合并前可选） |

## 开发 SOP

任务完成后默认流程：

1. `pnpm check` 验证通过（合并前可再跑 `pnpm check:full`）
2. 按模块拆分 git commit（`feat` / `fix` / `docs` / `chore`）
3. `git push` 到 `origin`（`main` 与 `master` 保持同步）
4. `cd apps/web` 后用 Vercel CLI 确认最新 **Production** 为 **Ready** 且构建日志无报错：

```bash
pnpm dlx vercel@latest ls
pnpm dlx vercel@latest inspect <deployment-url> --logs
```

详见 `.cursor/rules/git-pr.mdc`、`.cursor/rules/vercel-deploy.mdc`。

## CI / CD

| 环节 | 工具 | 触发时机 |
|------|------|----------|
| **CI** | GitHub Actions（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)） | `push` / `pull_request` 到 `main` / `master` |
| **CD** | Vercel（已关联 GitHub 仓库） | `main` 分支 push 后自动部署 |

### CI 检查项

两个 job **并行**执行，各阶段耗时会写入 GitHub Actions Summary，并上传 `.timing/` 产物：

```bash
pnpm check        # quality：并行 typecheck + lint + test（无需先 build shared）
pnpm build        # build：build:shared → build:web
pnpm check:full   # 全检：build:shared → 并行 build:web + typecheck:lib + test
```

`@my-blog/shared` 类型与运行时均指向源码；`build:shared` 仍用于生产编译校验。本地会打印分阶段耗时，并写入 `.timing/<job>.json` 与 `.timing/history.jsonl`。

### CD 说明

- 合并到 `main` 后 Vercel 自动构建并发布生产环境
- 环境变量（如 `POSTGRES_URL`）在 Vercel Dashboard 配置
- 前端约定见 `.cursor/rules/nextjs-16.mdc`、`frontend-web.mdc`
- 数据库迁移仍须手动执行 `pnpm db:setup`（一次性或 schema 变更时）

## 二期规划

- 用户认证与后台管理
- 评论系统
- 全文搜索
- Markdown 编辑器
