#!/bin/sh
# Applies the service's Prisma migrations (when it has any) and starts it with its own start script.
# RUN_MIGRATIONS=false skips the migration step, e.g. when a Kubernetes Job runs them instead.
set -e

if [ -d prisma/migrations ] && [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "applying database migrations"
  npx --no-install prisma migrate deploy
fi

# "node dist/index.js" → run node directly so it receives signals (graceful shutdown)
entry=$(node -p "(require('./package.json').scripts.start || 'node dist/index.js').replace(/^node\s+/, '')")
exec node $entry
