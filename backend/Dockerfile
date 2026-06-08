# syntax=docker/dockerfile:1
# ---- Backend (Express + TypeScript) on the Bun runtime ----
# Bun executes TypeScript natively, so there is no build/transpile step.

# 1. Install production dependencies against the frozen lockfile
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# 2. Runtime image
FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# App needs: node_modules (prod), source, seed data, tsconfig
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src
COPY data ./data

EXPOSE 5000

# Run as the unprivileged "bun" user that ships with the base image
USER bun

# Lightweight liveness check against the health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

CMD ["bun", "run", "src/server.ts"]
