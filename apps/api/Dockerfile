FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared packages/shared
COPY apps/api apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @my-blog/shared build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

RUN chmod +x /app/apps/api/docker-entrypoint.sh

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
