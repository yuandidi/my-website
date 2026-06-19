#!/bin/sh
set -e

cd /app/apps/api

echo "Running database migrations..."
pnpm exec prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  pnpm exec prisma db seed
fi

echo "Starting API server..."
exec node dist/main.js
