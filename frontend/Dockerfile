# syntax=docker/dockerfile:1
# ---- Frontend (Next.js 16) built and served on the Bun runtime ----
# Uses Next's standalone output for a small final image.

# 1. Install all dependencies (build needs devDeps: tailwind/postcss/types)
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Build the Next.js app
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* is inlined into the client bundle at build time — override at build:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api -t lokkho-frontend .
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN bun run build

# 3. Minimal runtime image (standalone server)
FROM oven/bun:1.3-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone bundles a trimmed node_modules + server.js; static assets are separate
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
# (this app has no public/ dir; add `COPY --from=builder /app/public ./public` if you create one)

EXPOSE 3000
USER bun

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/login || exit 1

CMD ["bun", "server.js"]
