# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
WORKDIR /app
RUN apk upgrade --no-cache

# ---------- deps ----------
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---------- builder ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env vars must be present at build time for Next to inline them.
# Override with --build-arg when building the image.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3004/api/v1
ARG NEXT_PUBLIC_ENDUSER_API_URL=http://localhost:3001/api/v1
ARG NEXT_PUBLIC_SITEMAN_API_URL=http://localhost:3003
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_ADMIN_API_URL=$NEXT_PUBLIC_ADMIN_API_URL
ENV NEXT_PUBLIC_ENDUSER_API_URL=$NEXT_PUBLIC_ENDUSER_API_URL
ENV NEXT_PUBLIC_SITEMAN_API_URL=$NEXT_PUBLIC_SITEMAN_API_URL

RUN npm run build

# ---------- runner ----------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('net').createConnection(${PORT:-3000}, '127.0.0.1').on('connect', s => { s.end(); process.exit(0); }).on('error', () => process.exit(1));"

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
