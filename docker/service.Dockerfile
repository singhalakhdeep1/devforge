# One image recipe for every backend workspace. Build from the repository root:
#   docker build -f docker/service.Dockerfile --build-arg SERVICE=backend/auth-service -t devforge/auth .
# SERVICE  workspace directory of the service
# DEPS     workspaces it needs built first (always the shared library; graphql-api also needs graphql-subscriptions)
# DB_TOOLS "true" adds pg_dump/pg_restore 16 and mongodump/mongorestore (backup-service)

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm-slim AS build
ARG SERVICE
ARG DEPS=backend/shared
WORKDIR /app
# python/make/g++ only matter when a native module has no prebuilt binary (e.g. mediasoup on an unusual CPU)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY backend ./backend
COPY websocket-server ./websocket-server
RUN set -eu; ws=""; for w in $DEPS $SERVICE; do ws="$ws -w $w"; done; npm ci $ws --include-workspace-root=false --no-audit --no-fund
RUN set -eu; for w in $DEPS $SERVICE; do npm run build -w $w; done

FROM node:${NODE_VERSION}-bookworm-slim
ARG SERVICE
ARG DB_TOOLS=false
ENV NODE_ENV=production
RUN set -eu; apt-get update; apt-get install -y --no-install-recommends openssl ca-certificates tini; \
    if [ "$DB_TOOLS" = "true" ]; then \
      apt-get install -y --no-install-recommends curl gnupg; \
      install -d /usr/share/postgresql-common/pgdg; \
      curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc; \
      echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list; \
      curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg; \
      echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" > /etc/apt/sources.list.d/mongodb-org-8.0.list; \
      apt-get update; apt-get install -y --no-install-recommends postgresql-client-16 mongodb-database-tools; \
    fi; \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
# node_modules holds the dependencies of the built workspaces only; prisma (a dev dependency) stays for migrate deploy
COPY --from=build --chown=node:node /app /app
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/devforge-entrypoint
RUN chmod +x /usr/local/bin/devforge-entrypoint && mkdir -p /data && chown node:node /data
WORKDIR /app/${SERVICE}
USER node
ENTRYPOINT ["/usr/bin/tini", "--", "devforge-entrypoint"]
