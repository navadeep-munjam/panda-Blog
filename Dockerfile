# ---------------------
# Build stage with Bun
# ---------------------
FROM oven/bun:1.2.9 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y git python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Copy Prisma schema before install
COPY prisma ./prisma

# Disable ESLint during build
ENV NEXT_PUBLIC_DISABLE_ESLINT=true

# Install dependencies
RUN bun install --frozen-lockfile

# Copy rest of the source
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---------------------
# Production stage with Node.js
# ---------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nodejs

# Copy dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy Prisma client
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copy built Next.js app
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next

# Copy public folder
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
USER nodejs

# Start server
CMD ["node_modules/.bin/next", "start"]
